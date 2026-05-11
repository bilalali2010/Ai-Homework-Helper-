interface Props {
  result: string;
}

export default function ResultPanel({ result }: Props) {
  return (
    <div className="mt-8 bg-slate-800 p-4 rounded-xl whitespace-pre-wrap">
      {result}
    </div>
  );
}
