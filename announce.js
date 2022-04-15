function announceSessions(sessions) {
  const here = Temporal.Now.timeZone();
  const now = Temporal.Now.instant();
  const timeZoneName = now.toLocaleString(undefined, { timeZoneName: 'long' });
  const formattedTimeZone = `UTC${here.getOffsetStringFor(now)} (${timeZoneName})`;

  const announcement = document.getElementById('announcement');
  announcement.innerHTML = `
    <ul>
      <li><strong>Dates</strong>:
        <ul id="announcement-dates">
        </ul>
      </li>
      <li><strong>Length</strong>:
        <ul id="announcement-lengths">
        </ul>
      </li>
      <li><strong>Timetable</strong>:
        <ul id="announcement-timetables">
          <li>All times are in your browser's local time zone, <strong>${formattedTimeZone}</strong></li>
        </ul>
      </li>
    </ul>
  `;

  const dates = document.getElementById('announcement-dates');
  const lengths = document.getElementById('announcement-lengths');
  const timetables = document.getElementById('announcement-timetables');

  for (const { start, length } of sessions) {
    const begin = Temporal.ZonedDateTime.from(start);
    const end = begin.add(length);

    const dateFormatter = new Intl.DateTimeFormat(undefined, { dateStyle: 'long' });
    const dateAnnouncement = document.createElement('li')
    dateAnnouncement.textContent = dateFormatter.formatRange(begin, end);
    dates.append(dateAnnouncement);

    const balancedLength = Temporal.Duration.from(length).round({
      largestUnit: 'hours',
      smallestUnit: 'minutes',
    });
    const lengthAnnouncement = document.createElement('li');
    if (balancedLength.hours)
      lengthAnnouncement.textContent = `${balancedLength.hours} h `;
    if (balancedLength.minutes)
      lengthAnnouncement.textContent += `${balancedLength.minutes} m`;
    lengths.append(lengthAnnouncement);

    const timeFormatter = new Intl.DateTimeFormat(undefined, { timeStyle: 'short' });
    const timetableAnnouncement = document.createElement('li');
    timetableAnnouncement.textContent = timeFormatter.formatRange(begin, end);
    timetables.append(timetableAnnouncement);
  }
}

function printAgendaItemTimetables(items) {
  const timeFormatter = new Intl.DateTimeFormat(undefined, { timeStyle: 'short' });
  for (const { id, start, length } of items) {
    const begin = Temporal.ZonedDateTime.from(start);
    const end = begin.add(length);

    const timetableSpan = document.getElementById(`${id}-timetable`);
    timetableSpan.textContent = timeFormatter.formatRange(begin, end);
  }
}
