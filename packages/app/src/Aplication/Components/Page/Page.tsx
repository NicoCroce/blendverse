import { Title } from '../Typography/Title';

interface PageProps {
  children: React.ReactNode;
  title: string;
}

export const Page = ({ children, title }: PageProps) => (
  <div className="page p-4 flex flex-col gap-6 bg-slate-50 md:p-6 md:pt-10">
    <Title variant="h1">{title}</Title>
    <section className="overflow-auto h-[100dvh] pb-36">{children}</section>
  </div>
);
