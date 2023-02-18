interface Props {
  children: React.ReactNode;
  className?: string;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

export default function Form({
  children,
  className,
  onSubmit,
}: Props): JSX.Element {
  return (
    <form onSubmit={onSubmit} className={className}>
      {children}
    </form>
  );
}
