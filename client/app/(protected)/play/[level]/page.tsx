import { Metadata } from "next";
import PlayPage from "./page.client";

interface Props {
  params: {
    level: string;
  };
}

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const { level } = await params;

  return {
    title: `Level ${level} | Recalli`,
  };
};

export default async function page({ params }: Props) {
  const { level } = await params;
  return <PlayPage level={Number(level)} />;
}
