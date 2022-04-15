globalThis.Temporal = temporal.Temporal;
globalThis.Intl = temporal.Intl;

function announceSessions(sessions) {
  const here = Temporal.Now.timeZone();
  const now = Temporal.Now.instant();

  let formattedTimeZone;
  try {
    const nameFormatter = new Intl.DateTimeFormat(undefined, { timeZoneName: 'longGeneric' });
    formattedTimeZone = nameFormatter.formatToParts(now).find(({ type }) => type === 'timeZoneName').value;
  } catch (e) {
    formattedTimeZone = here.id;  // Fall back to IANA time zone ID
  }
  const offsetString = here.getOffsetStringFor(now);

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
          <li>
            All times are in your browser's local time zone,
            <strong>${formattedTimeZone}</strong>
            (currently UTC${offsetString})
          </li>
        </ul>
      </li>
    </ul>
  `;

  const dates = document.getElementById('announcement-dates');
  const lengths = document.getElementById('announcement-lengths');
  const timetables = document.getElementById('announcement-timetables');

  const dateFormatter = new Intl.DateTimeFormat(undefined, { dateStyle: 'long' });
  const timeFormatter = new Intl.DateTimeFormat(undefined, { timeStyle: 'short' });
  const weekdayFormatter = new Intl.DateTimeFormat(undefined, { weekday: 'long' });

  for (const { start, length } of sessions) {
    const begin = Temporal.ZonedDateTime.from(start).withTimeZone(here);
    const end = begin.add(length);

    const dateAnnouncement = document.createElement('li')
    dateAnnouncement.textContent = dateFormatter.formatRange(begin, end);
    dates.append(dateAnnouncement);

    const balancedLength = Temporal.Duration.from(length).round({
      largestUnit: 'hours',
      smallestUnit: 'minutes',
    });
    const lengthAnnouncement = document.createElement('li');
    const weekday = weekdayFormatter.format(begin);
    lengthAnnouncement.textContent = `${weekday}: `;
    if (balancedLength.hours)
      lengthAnnouncement.textContent += `${balancedLength.hours} h `;
    if (balancedLength.minutes)
      lengthAnnouncement.textContent += `${balancedLength.minutes} m`;
    lengths.append(lengthAnnouncement);

    const timetableAnnouncement = document.createElement('li');
    const timetable = timeFormatter.formatRange(begin, end);
    timetableAnnouncement.textContent = `${weekday}: ${timetable}`
    timetables.append(timetableAnnouncement);
  }
}

function printAgendaItemTimetables(items) {
  const here = Temporal.Now.timeZone();

  const timeFormatter = new Intl.DateTimeFormat(undefined, { timeStyle: 'short' });

  for (const { id, start, length } of items) {
    const begin = Temporal.ZonedDateTime.from(start).withTimeZone(here);
    const end = begin.add(length);

    const timetableSpan = document.getElementById(`${id}-timetable`);
    timetableSpan.textContent = timeFormatter.formatRange(begin, end);
  }
}
