
export default function DateTimeFormat({ dateTime }) {
  const dateFormat = new Date(dateTime)?.toLocaleString();
  return <span>{dateFormat}</span>;
}
