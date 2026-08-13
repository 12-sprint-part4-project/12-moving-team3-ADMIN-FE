/** 긴 본문용. 라벨 아래에 두고 줄바꿈을 유지한다. */
export const DetailMultilineField = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => (
  <div className="flex flex-col gap-1">
    <dt className="shrink-0 text-gray-500">{label}</dt>
    <dd className="whitespace-pre-wrap break-words text-black-400">{value}</dd>
  </div>
);
