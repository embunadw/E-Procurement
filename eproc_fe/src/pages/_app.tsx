import type { AppProps } from "next/app";
import type { NextPage } from "next";
import "../styles/globals.css";
import dynamic from "next/dynamic";
import { ReactElement, ReactNode } from "react";

const GlobalInit = dynamic(() => import("../components/GlobalInit"), {
  ssr: false,
});

type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page) => page);

  return (
    <>
      {getLayout(<Component {...pageProps} />)}
      <GlobalInit />
    </>
  );
}
