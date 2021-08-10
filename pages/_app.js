import { createTheme, ThemeProvider } from '@material-ui/core';
import { lightGreen } from '@material-ui/core/colors';

export default function MyApp({ Component, pageProps }) {
  const theme = createTheme({
    palette: {
      type: 'dark',
      primary: {
        main: lightGreen[700],
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <Component {...pageProps} />
    </ThemeProvider>
  );
}
