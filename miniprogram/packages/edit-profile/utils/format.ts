import { formatUtcString } from '../../../utils/format'

export function formatBirthday(birthday: { Time: string; Valid: boolean }) {
  const { Time, Valid } = birthday
  let time = ''
  if (Valid) {
    time = formatUtcString(Time, 'YYYY-MM-DD')
  }
  return {
    Time: time,
    Valid
  }
}
