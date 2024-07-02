import type { ReactElement, ReactNode } from "react";
import type { NextPage } from "next";

import Layout from "@/components/layout";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { persistStore } from "redux-persist";

import "@fontsource/roboto";

let persistor = persistStore(store);

import { store } from "../store/store";

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page) => page);
  return(
    <div >
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <Layout>
            {getLayout(<Component {...pageProps} />)}
          </Layout>
        </PersistGate>
      </Provider>
    </div>
  );
}
