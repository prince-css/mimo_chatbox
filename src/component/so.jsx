import React from "react";
//I am making a simple video-calling app using webRTC. Everything is working as expected in firefox. But in chrome and opera the remote-stream is not showing up on any side(caller and callee).The video canvas is always buffering(and black). I have gone through every solution related to this on StackOverflow but nothing worked out.I am using socket.io for signalling and communication between peers.In which there is a room of two members in it.So, I don't need to select any specific user_id to make any call(for simplicity).  Here is my code(simple version):
function ChatBox(props) {
	const peerRef = useRef();
	const mediaRef = useRef();
	const displayRef = useRef();

	const openMediaDevices = async () => {
		var stream = await navigator.mediaDevices.getUserMedia({
			video: true,
			audio: true,
		});
		console.log("Got mediastream : ", stream);
		console.log(mediaRef.current);
		mediaRef.current.srcObject = stream;

		return stream;
	};
	const iceCandidateEventHandler = (e) => {
		console.log("candidate emit kori");
		if (e.candidate) {
			socket.emit("candidate", {
				type: "new-ice-candidate",
				candidate: e.candidate,
			});
		}
	};
	const newICECandidateHandler = async (data) => {
		console.log("candidate pailam", data);
		try {
			const candidate = new RTCIceCandidate(data.candidate);
			await peerRef.current.addIceCandidate(candidate);
		} catch (error) {
			console.log(error);
		}
	};
	const negotiationNeededEventHandler = async () => {
		console.log("offer pathacchi...");
		try {
			const offerObj = await peerRef.current.createOffer();
			await peerRef.current.setLocalDescription(offerObj);
			const data = {
				type: "offer",
				sdp: peerRef.current.localDescription,
			};

			socket.emit("offer", data);
		} catch (error) {
			console.log(error);
		}
	};
	const offerHandler = async (data) => {
		console.log("offer pailam...");
		console.log(data);
		try {
			peerRef.current = createPeer();
			const desc = new RTCSessionDescription(data.sdp);
			await peerRef.current.setRemoteDescription(desc);
			const localStream = await openMediaDevices();
			for (const track of localStream.getTracks()) {
				peerRef.current.addTrack(track, localStream);
			}
			const answerObj = await peerRef.current.createAnswer();
			await peerRef.current.setLocalDescription(answerObj);
			const ansData = {
				type: "answer",
				sdp: peerRef.current.localDescription,
			};
			console.log("answer pathacchi...");
			socket.emit("answer", ansData);
		} catch (error) {
			console.log(error);
		}
	};
	const answerHandler = async (ansData) => {
		console.log("answer pailam");
		console.log(ansData);
		try {
			const desc = new RTCSessionDescription(ansData.sdp);
			await peerRef.current.setRemoteDescription(desc);
		} catch (error) {
			console.log(error);
		}
	};
	const trackEventHandler = (e) => {
		console.log(e.streams);
		displayRef.current.srcObject = e.streams[0];
		displayRef.current.autoplay = true;
		displayRef.current.playsInline = true;
		displayRef.current.muted = true;
	};
	const createPeer = () => {
		const configuration = {
			iceServers: [
				{
					urls: "stun:stun.stunprotocol.org",
				},
				{
					urls: "turn:numb.viagenie.ca",
					credential: "muazkh",
					username: "webrtc@live.com",
				},
			],
		};
		const peerConnection = new RTCPeerConnection(configuration);
		peerConnection.onicecandidate = iceCandidateEventHandler;
		peerConnection.ontrack = trackEventHandler;
		peerConnection.onnegotiationneeded = negotiationNeededEventHandler;

		return peerConnection;
	};

	useEffect(() => {
		socket.on("offer", (data) => offerHandler(data));
		socket.on("answer", (ansData) => answerHandler(ansData));
		socket.on("candidate", (data) => newICECandidateHandler(data));
	}, []);

	const callHandler = async () => {
		peerRef.current = createPeer("caller");
		const localStream = await openMediaDevices();
		for (const track of localStream.getTracks()) {
			peerRef.current.addTrack(track, localStream);
		}
	};
	return (
		<div className={styles.boxContainer}>
			<video
				ref={mediaRef}
				id="localVideo"
				autoplay
				playsinline
				controls="false"
			/>
			<video
				ref={displayRef}
				id="displayVideo"
				autoplay
				playsinline
				controls="false"
			/>
		</div>
	);
}

export default so;
