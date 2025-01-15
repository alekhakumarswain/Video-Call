import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';

const VideoCall = () => {
  const { id } = useParams();
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const [peerConnection, setPeerConnection] = useState(null);
  const [error, setError] = useState(null);
  const [isRemoteUserConnected, setIsRemoteUserConnected] = useState(false);
  const [logs, setLogs] = useState([]);

  const addLog = (message) => {
    setLogs((prevLogs) => [...prevLogs, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const handleCallUser = async () => {
    if (peerConnection) {
      try {
        addLog('Creating offer');
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        socket.emit('offer', { offer, room: id });
      } catch (err) {
        console.error('Error creating offer:', err);
        setError('An error occurred while trying to initiate the call. Please try again.');
      }
    }
  };

  const checkExistingRoom = () => {
    addLog('Checking if room already exists');
    socket.emit('check-room', id);
  };

  const handleReceiveOffer = async (offer) => {
    if (peerConnection) {
      try {
        addLog('Received offer, setting remote description');
        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        addLog('Creating answer');
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        socket.emit('answer', { answer, room: id });
      } catch (err) {
        console.error('Error handling offer:', err);
        setError('An error occurred while trying to connect to the remote user. Please try again.');
      }
    }
  };

  const handleReceiveAnswer = async (answer) => {
    if (peerConnection) {
      try {
        addLog('Received answer, setting remote description');
        await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
      } catch (err) {
        console.error('Error setting remote description:', err);
        setError('An error occurred while trying to establish the connection. Please try again.');
      }
    }
  };

  const handleNewICECandidate = async (candidate) => {
    if (peerConnection) {
      try {
        addLog('Received ICE candidate');
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error('Error adding ICE candidate:', err);
        setError('An error occurred while trying to establish the connection. Please try again.');
      }
    }
  };

  useEffect(() => {
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
      ],
    });
    setPeerConnection(pc);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        addLog('Sending ICE candidate');
        newSocket.emit('ice-candidate', { candidate: event.candidate, room: id });
      }
    };

    pc.oniceconnectionstatechange = () => {
      addLog(`ICE connection state: ${pc.iceConnectionState}`);
    };

    pc.ontrack = (event) => {
      addLog('Received remote track');
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
        setIsRemoteUserConnected(true);
      }
    };

    newSocket.on('connect', () => {
      addLog('Connected to signaling server');
      newSocket.emit('join-room', id);
      checkExistingRoom();
    });

    newSocket.on('user-connected', () => {
      addLog('Remote user joined the room');
      handleCallUser();
    });

    newSocket.on('offer', handleReceiveOffer);
    newSocket.on('answer', handleReceiveAnswer);
    newSocket.on('ice-candidate', handleNewICECandidate);
    newSocket.on('room-exists', handleCallUser);

    const getMediaStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        addLog('Local media stream obtained');
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        stream.getTracks().forEach((track) => {
          pc.addTrack(track, stream);
        });
      } catch (err) {
        console.error('Error accessing media devices.', err);
        if (err.name === 'NotReadableError') {
          setError('Unable to access your camera or microphone. Please ensure no other application is using them and try again.');
        } else {
          setError('An error occurred while trying to access your camera and microphone. Please check your permissions and try again.');
        }
      }
    };

    getMediaStream();

    return () => {
      newSocket.close();
      pc.close();
    };
  }, [id]);


  return (
    <div className="row">
      <div className="col-md-6">
        <h2>Local Video</h2>
        <video ref={localVideoRef} autoPlay muted playsInline className="img-fluid" />
      </div>
      <div className="col-md-6">
        <h2>Remote Video</h2>
        {isRemoteUserConnected ? (
          <video ref={remoteVideoRef} autoPlay playsInline className="img-fluid" />
        ) : (
          <div className="alert alert-info">Waiting for remote user to connect...</div>
        )}
      </div>
      {error && (
        <div className="col-12 mt-3">
          <div className="alert alert-danger">{error}</div>
        </div>
      )}
      <div className="col-12 mt-3">
        <h3>Connection Logs</h3>
        <pre className="border p-3" style={{height: '200px', overflowY: 'scroll'}}>
          {logs.join('\n')}
        </pre>
      </div>
    </div>
  );
};

export default VideoCall;

