globalThis.Temporal = temporal.Temporal;
globalThis.Intl = temporal.Intl;

const hqTimeZoneID = 'Europe/Madrid';

function announceSessions(sessions) {
  const here = Temporal.Now.timeZone();
  const hq = Temporal.TimeZone.from(hqTimeZoneID);
  const now = Temporal.Now.instant();

  const formattedLocalTimeZone = timeZoneDisplayName(here, now);
  const formattedHQTimeZone = timeZoneDisplayName(hq, now);
  const localOffsetString = here.getOffsetStringFor(now);
  const hqOffsetString = hq.getOffsetStringFor(now);

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
            Local times are in your browser's local time zone,
            <strong>${formattedLocalTimeZone}</strong>
            (currently UTC${localOffsetString})
          </li>
          <li>
            HQ times are in
            <strong>${formattedHQTimeZone}</strong>
            (currently UTC${hqOffsetString})
        </ul>
      </li>
    </ul>
  `;

  const dates = document.getElementById('announcement-dates');
  const lengths = document.getElementById('announcement-lengths');
  const timetables = document.getElementById('announcement-timetables');

  const localDateFormatter = new Intl.DateTimeFormat(undefined, { dateStyle: 'long' });
  const localTimeFormatter = new Intl.DateTimeFormat(undefined, { timeStyle: 'short' });
  const localWeekdayFormatter = new Intl.DateTimeFormat(undefined, { weekday: 'long' });
  const hqDateFormatter = new Intl.DateTimeFormat(undefined, { timeZone: hqTimeZoneID, dateStyle: 'long' });
  const hqTimeFormatter = new Intl.DateTimeFormat(undefined, { timeZone: hqTimeZoneID, timeStyle: 'short' });
  const hqWeekdayFormatter = new Intl.DateTimeFormat(undefined, { timeZone: hqTimeZoneID, weekday: 'long' });

  for (const { start, length } of sessions) {
    const begin = Temporal.ZonedDateTime.from(start);
    const end = begin.add(length);
    const localBegin = begin.withTimeZone(here);
    const localEnd = end.withTimeZone(here);

    const dateAnnouncement = document.createElement('li');
    const localDates = localDateFormatter.formatRange(localBegin, localEnd);
    const hqDates = hqDateFormatter.formatRange(begin, end);
    if (localDates === hqDates)
        dateAnnouncement.textContent = localDates;
    else
        dateAnnouncement.textContent = `${localDates} local (${hqDates} in HQ)`;
    dates.append(dateAnnouncement);

    const balancedLength = Temporal.Duration.from(length).round({
      largestUnit: 'hours',
      smallestUnit: 'minutes',
    });
    const lengthAnnouncement = document.createElement('li');
    const localWeekday = localWeekdayFormatter.format(localBegin);
    const hqWeekday = hqWeekdayFormatter.format(begin);
    if (localWeekday === hqWeekday)
        lengthAnnouncement.textContent = `${localWeekday}: `;
    else
        lengthAnnouncement.textContent = `${localWeekday} local (Note, this is on ${hqWeekday} in HQ): `;
    if (balancedLength.hours)
      lengthAnnouncement.textContent += `${balancedLength.hours} h `;
    if (balancedLength.minutes)
      lengthAnnouncement.textContent += `${balancedLength.minutes} m`;
    lengths.append(lengthAnnouncement);

    const timetableAnnouncement = document.createElement('li');
    const localTimetable = localTimeFormatter.formatRange(localBegin, localEnd);
    const hqTimetable = hqTimeFormatter.formatRange(begin, end);
    timetableAnnouncement.textContent = `${localWeekday}: ${localTimetable} local, ${hqTimetable} HQ`;
    timetables.append(timetableAnnouncement);
  }
}

function timeZoneDisplayName(tz, instant) {
    try {
        const nameFormatter = new Intl.DateTimeFormat(undefined, {
            timeZone: tz.id,
            timeZoneName: 'longGeneric',
        });
        return nameFormatter.formatToParts(instant).find(({ type }) => type === 'timeZoneName').value;
    } catch (e) {
        console.log('error getting time zone display name', e);
        return tz.id;  // Fall back to IANA time zone ID
    }
}

function printAgendaItemTimetables(items) {
  const here = Temporal.Now.timeZone();

  const localTimeFormatter = new Intl.DateTimeFormat(undefined, { timeStyle: 'short' });
  const hqTimeFormatter = new Intl.DateTimeFormat(undefined, { timeZone: hqTimeZoneID, timeStyle: 'short' });

  for (const { id, start, length } of items) {
    const begin = Temporal.ZonedDateTime.from(start);
    const end = begin.add(length);
    const localBegin = begin.withTimeZone(here);
    const localEnd = end.withTimeZone(here);

    const timetableSpan = document.getElementById(`${id}-timetable`);
    const formattedLocalTime = localTimeFormatter.formatRange(localBegin, localEnd);
    const formattedHQTime = hqTimeFormatter.formatRange(begin, end);
    timetableSpan.textContent = `${formattedLocalTime} local, ${formattedHQTime} HQ`;
  }
}

if (typeof sessions !== 'undefined' && typeof agendaItemTimetables !== 'undefined') {
  document.addEventListener('DOMContentLoaded', function () {
    announceSessions(sessions);
    printAgendaItemTimetables(agendaItemTimetables);
  });
}
