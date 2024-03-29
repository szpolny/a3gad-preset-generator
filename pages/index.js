import Head from 'next/head';
import * as fetch from 'node-fetch';
import { useState } from 'react';
import {
  Box,
  Button,
  Container,
  CssBaseline,
  Snackbar,
  Typography,
  makeStyles,
} from '@material-ui/core';
import MuiAlert from '@material-ui/lab/Alert';
import { Add as AddIcon } from '@material-ui/icons';

const Alert = (props) => {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
};

const useStyles = makeStyles((theme) => ({
  paper: {
    display: 'flex',
    height: '95vh',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    marginTop: theme.spacing(1),
  },
  footer: {
    display: 'flex',
    color: 'gray',
    height: '5vh',
    alignItems: 'center',
    justifyContent: 'center',
  },
  serverInfo: {
    textAlign: 'center',
    marginTop: theme.spacing(7),
  },
}));

export async function getServerSideProps() {
  const res = await fetch(`https://api.battlemetrics.com/servers/12205171`);
  const serverInfo = await res.json();

  return {
    props: {
      serverInfo,
    },
  };
}

export default function Home({ serverInfo }) {
  const classes = useStyles();

  const [errorDialog, setErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [successDialog, setSuccessDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const gameServer = serverInfo.data.attributes;

  const handleErrorClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setErrorDialog(false);
  };

  const handleSuccessClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setSuccessDialog(false);
  };

  const onFileChange = (e) => {
    const file = e.target.files[0];

    if (file.name.split('.').pop() !== 'html') {
      setErrorMessage('Wrong filetype!');
      setErrorDialog(true);
      return;
    }

    const reader = new global.FileReader();

    reader.onload = (event) => {
      const fileString = event.target.result;

      const fileHtml = new global.DOMParser().parseFromString(
        fileString,
        'text/html',
      );

      const mods = [
        ...fileHtml
          .getElementsByClassName('mod-list')[0]
          .getElementsByTagName('tr'),
      ].map((item) => {
        const innerHtml = new global.DOMParser().parseFromString(
          item.innerHTML,
          'text/html',
        );

        const modFullName = innerHtml.body.childNodes[0].data;

        const modName = modFullName
          .substr(0, modFullName.indexOf('\n'))
          .split(' ')
          .join('')
          .toLowerCase()
          .replace(/[^a-zA-Z ]/g, '');

        const modUrl = innerHtml.body.childNodes[3].href;
        const modId = modUrl
          .substring(modUrl.lastIndexOf('/') + 1)
          .substring(4);

        return { modName, modId };
      });

      let modsList = '';

      mods.forEach((item) => {
        modsList += `@${item.modName}:${item.modId}\n`;
      });

      global.navigator.clipboard.writeText(modsList).then(
        () => {
          setSuccessMessage('Copied to clipboard!');
          setSuccessDialog(true);
        },
        (error) => {
          console.error(error);
          console.log(modsList);
          setErrorMessage(
            'An error occurred while copying. Mod list has been posted in the console (ctrl + shift + i)',
          );
          setErrorDialog(true);
        },
      );
    };

    reader.readAsBinaryString(file);
  };

  return (
    <Container component="main">
      <CssBaseline />
      <Head>
        <title>GAD Preset Generator</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={classes.paper}>
        <Typography component="h1" variant="h5">
          GAD Preset Generator
        </Typography>
        <Button
          className={classes.button}
          variant="contained"
          color="primary"
          component="label"
        >
          Upload File <AddIcon />
          <input onChange={(e) => onFileChange(e)} type="file" hidden />
        </Button>
        <Box className={classes.serverInfo}>
          <Typography component="h2" variant="h7">
            Server Information:
          </Typography>
          <p>
            <span style={{ fontWeight: 'bold' }}>Name:</span> {gameServer.name}
          </p>
          <p>
            <span style={{ fontWeight: 'bold' }}>Address:</span> {gameServer.ip}
            :{gameServer.port}
          </p>
          <p>
            <span style={{ fontWeight: 'bold' }}>Players:</span>{' '}
            {gameServer.players}/{gameServer.maxPlayers}
          </p>
          <p>
            <span style={{ fontWeight: 'bold' }}>Mission:</span>{' '}
            {gameServer.details.mission}
          </p>
          <p>
            <span style={{ fontWeight: 'bold' }}>Map:</span>{' '}
            {gameServer.details.map}
          </p>
        </Box>
      </div>
      <Box className={classes.footer}>
        Created with{' '}
        <span style={{ color: '#ff4d4d', padding: '0px 4px' }}>❤</span> by
        sellectuwa
      </Box>
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        open={errorDialog}
        autoHideDuration={3500}
        onClose={handleErrorClose}
      >
        <Alert onClose={handleErrorClose} severity="error">
          {errorMessage}
        </Alert>
      </Snackbar>
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        open={successDialog}
        autoHideDuration={3500}
        onClose={handleSuccessClose}
      >
        <Alert onClose={handleSuccessClose} severity="success">
          {successMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}
