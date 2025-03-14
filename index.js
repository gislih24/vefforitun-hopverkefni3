// frontend link: https://2025-veff-assignment3-group1.netlify.app/
const express = require('express');

/* Import a body parser module to be able to access the request body as json */
const bodyParser = require('body-parser');

/* Use cors to avoid issues with testing on localhost */
const cors = require('cors');

const app = express();

/* Base url parameters and port settings */
const apiPath = '/api/';
const version = 'v1';
const port = 3000;

const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    NOT_FOUND: 404,
    CONFLICT: 409,
};

/* Set Cors-related headers to prevent blocking of local requests */
app.use(bodyParser.json());
app.use(cors());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept',
    );
    next();
});

/* Initial Data */
const songs = [
    { id: 1, title: 'Cry For Me', artist: 'The Weeknd' },
    { id: 2, title: 'Busy Woman', artist: 'Sabrina Carpenter' },
    {
        id: 3,
        title: 'Call Me When You Break Up',
        artist: 'Selena Gomez, benny blanco, Gracie Adams',
    },
    { id: 4, title: 'Abracadabra', artist: 'Lady Gaga' },
    { id: 5, title: 'Róa', artist: 'VÆB' },
    { id: 6, title: 'Messy', artist: 'Lola Young' },
    { id: 7, title: 'Lucy', artist: 'Idle Cave' },
    { id: 8, title: 'Eclipse', artist: 'parrow' },
];

const playlists = [
    { id: 1, name: 'Hot Hits Iceland', songIds: [1, 2, 3, 4] },
    { id: 2, name: 'Workout Playlist', songIds: [2, 5, 6] },
    { id: 3, name: 'Lo-Fi Study', songIds: [] },
];
/*  Our id counters
    We use basic integer ids in this assignment, but other solutions (such as UUIDs) would be better. */
let nextSongId = 9;
let nextPlaylistId = 4;
/* --------------------------------ENDPOINTS-------------------------------- */
/* --------------------------

        SONGS ENDPOINTS     

-------------------------- */
// MARK: Songs
/* 1. Read all songs */
app.get(apiPath + version + '/songs', (req, res) => {
    // If filter is empty
    if (!req.query.filter) {
        // then just return all the songs.
        return res.status(HTTP_STATUS.OK).json(songs);
    }

    // Filter songs where title or artist includes the filter (case-insensitive)
    const filteredSongs = songs.filter((song) => {
        return (
            song.title.toLowerCase().includes(req.query.filter.toLowerCase()) ||
            song.artist.toLowerCase().includes(req.query.filter.toLowerCase())
        );
    });

    return res.status(HTTP_STATUS.OK).json(filteredSongs);
});

/* 2. Create a new song */
app.post(apiPath + version + '/songs', (req, res) => {
    // Check if request body contains required fields
    if (
        req.body === undefined ||
        req.body.title !== 'string' ||
        req.body.artist !== 'string'

    ) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
            message:
                'Title and artist fields are required in the request body.',
        });
    }
    // Check if song already exists in the songs list
    if (
        songs.some(
            (song) =>
                song.title.toLowerCase() === req.body.title.toLowerCase() &&
                song.artist.toLowerCase() === req.body.artist.toLowerCase(),
        )
    ) {
        return res.status(HTTP_STATUS.CONFLICT).json({
            message: 'Song already exists',
        });
    }
    // Create new song object and add it to the songs array
    const newSong = {
        title: req.body.title,
        artist: req.body.artist,
        id: nextSongId,
    };
    songs.push(newSong);
    nextSongId++;
    return res.status(HTTP_STATUS.CREATED).json(newSong);
});

/* 3. Partially update a song */
app.patch(apiPath + version + '/songs/:songId', (req, res) => {
    // Check that at least one field (title or artist) is provided
    if (
        req.body === undefined ||
        (req.body.title === undefined && req.body.artist === undefined)
    ) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
            message:
                'Either title or artist field is required in the request body',
        });
    }

    const song = songs.find((song) => song.id == req.params.songId);
    // If the song is not found in the array, return an error.
    if (!song) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
            message: 'Song with id ' + req.params.songId + ' does not exist.',
        });
    }

    // Update the fields that were provided
    if (req.body.title !== undefined) {
        song.title = req.body.title;
    }
    if (req.body.artist !== undefined) {
        song.artist = req.body.artist;
    }
    return res.status(HTTP_STATUS.OK).json(song);
});

/* 4. Delete a song */
app.delete(apiPath + version + '/songs/:songId', (req, res) => {
    // Converts songId from string → integer(base 10)
    const songId = parseInt(req.params.songId, 10);
    // If the song is found in any playlist, block the request
    for (const playlist of playlists) {
        if (playlist.songIds.includes(songId)) {
            return res.status(HTTP_STATUS.CONFLICT).json({
                message:
                    'Cannot delete song since it is part of an existing playlist.',
            });
        }
    }

    const index = songs.findIndex((song) => song.id === songId);
    // If the song is not found in the array, return an error
    if (index === -1) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
            message: 'Song with id ' + songId + ' does not exist.',
        });
    }
    // Remove the song from the array
    const deletedSong = songs.splice(index, 1)[0];
    // Return the deleted song
    return res.status(HTTP_STATUS.OK).json(deletedSong);
});

/* --------------------------

      PLAYLISTS ENDPOINTS    

-------------------------- */
// MARK: Read all playlists
/* 1. Read all playlists */

app.get(apiPath + version + '/playlists', (req, res) => {
    res.status(HTTP_STATUS.OK).json(playlists);
});

// MARK: Read a specific playlists
/* 2. Read a specific playlist */

app.get(apiPath + version + '/playlists/:id', (req, res) => {
    const playlistId = parseInt(req.params.id, 10);
    const playlist = playlists.find((pl) => pl.id === playlistId);

    if (!playlist) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
            error: 'Playlist not found',
        });
    }

    // Create a new array containing the full song objects
    const songsInPlaylist = playlist.songIds
        .map((songId) => songs.find((song) => song.id === songId))
        .filter(Boolean);

    // Return the playlist with the full song objects
    return res.status(HTTP_STATUS.OK).json({
        id: playlist.id,
        name: playlist.name,
        songIds: playlist.songIds,
        songs: songsInPlaylist,
    });
});

// MARK: Create a new playlists
/* 3. Create a new playlist */

app.post(apiPath + version + '/playlists', (req, res) => {
    // Check if request body contains required fields
    if (req.body === undefined || req.body.name === undefined) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
            message: 'Name field is required in the request body.',
        });
    }
    // Check if playlist already exists in the playlist list
    if (playlists.some((playlist) => playlist.name === req.body.name)) {
        return res.status(HTTP_STATUS.CONFLICT).json({
            message: 'Playlist already exists',
        });
    }
    // Create new playlist object and add it to the playlists array
    const newPlaylist = {
        id: nextPlaylistId,
        name: req.body.name,
        songIds: [],
    };
    playlists.push(newPlaylist);
    nextPlaylistId++;
    return res.status(HTTP_STATUS.CREATED).json(newPlaylist);
});

// MARK: Add song to an existing playlist
/* 4. Add song to an existing playlist */

app.patch(
    apiPath + version + '/playlists/:playlistId/songs/:songId',
    (req, res) => {
        const playlistIdNum = Number(req.params.playlistId);
        const songIdNum = Number(req.params.songId);
        const playlist = playlists.find(
            (currentPlaylist) => currentPlaylist.id === playlistIdNum,
        );

        if (!playlist) {
            // If the playlist is not found in the array, return an error.
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                message: 'Playlist not found',
            });
        }

        const song = songs.find((song) => song.id === songIdNum);
        // If the song is not found in the array, return an error.
        if (!song) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                message: 'Song not found',
            });
        }

        // Check if the song is already in the playlist
        if (playlist.songIds.includes(songIdNum)) {
            return res.status(HTTP_STATUS.CONFLICT).json({
                message: 'Song already exists in the playlist',
            });
        }

        // Add the songId to the playlist's songIds array
        playlist.songIds.push(songIdNum);

        // Create a new array containing the full song objects
        const songsInPlaylist = playlist.songIds
            .map((songId) => songs.find((song) => song.id === songId))
            .filter(Boolean);

        return res.status(HTTP_STATUS.OK).json({
            id: playlist.id,
            name: playlist.name,
            songIds: playlist.songIds,
            songs: songsInPlaylist,
        });
    },
);

/* --------------------------

      SERVER INITIALIZATION  
      
!! DO NOT REMOVE OR CHANGE THE FOLLOWING (IT HAS TO BE AT THE END OF THE FILE) !!
      
-------------------------- */
if (process.env.NODE_ENV !== 'test') {
    app.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
    });
}

module.exports = app;
