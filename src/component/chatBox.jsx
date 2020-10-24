import React, { useState, useEffect, useContext, useRef } from "react";
import "emoji-mart/css/emoji-mart.css";
import { Picker } from "emoji-mart";
import io from "socket.io-client";
import Box from "@material-ui/core/Box";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";
import { makeStyles, StylesProvider } from "@material-ui/core/styles";
import SendIcon from "@material-ui/icons/Send";
import SentimentSatisfiedOutlinedIcon from "@material-ui/icons/SentimentSatisfiedOutlined";
import {
	Button,
	Card,
	CardContent,
	TextField,
	Paper,
	Icon,
	Chip,
	Avatar,
	Grid,
} from "@material-ui/core";
import styles from "../css/chatBox.module.css";
import { deepPurple, orange, pink } from "@material-ui/core/colors";
import Axios from "axios";
import { getMsgs } from "../services/msgService";
import { UserContext } from "../context/userContext";
import { emojiConverter } from "react-easy-emoji";

let negotiated;
let count = false;
let messages = [
	{
		id: "",
		username: "",
		message: "",
		color: "blue",
		time: "",
	},
];

const socket = io("https://mimo-backend.herokuapp.com/");
//const socket = io("http://localhost:4000/");
function ChatBox(props) {
	const [msgs, setMsgs] = useState(messages);
	const [myMsg, setMyMsg] = useState();
	const [bool, setBool] = useState(false);
	const [showPicker, setShowPicker] = useState(false);
	const [remoteUsers, setRemoteUsers] = useState([]);
	const fetchedData = useContext(UserContext);
	const scrollRef = useRef();
	const peerRef = useRef();
	const peer2Ref = useRef();
	const payloadRef = useRef();
	const answerRef = useRef();
	const inputRef = useRef();
	const mediaRef = useRef();
	const displayRef = useRef();
	const callRef = useRef();
	socket.on("connection", () => {
		// console.log("frontend is connected");
	});

	socket.on("disconnect", () => {
		// console.log("frontend is disconnected");
	});
	const openMediaDevices = async () => {
		var stream = await navigator.mediaDevices.getUserMedia({
			video: true,
			audio: true,
		});
		// console.log("Got mediastream : ", stream);
		// console.log(mediaRef.current);
		mediaRef.current.srcObject = stream;
		mediaRef.current.autoplay = true;
		mediaRef.current.playsInline = true;
		mediaRef.current.muted = true;
		count = true;
		return stream;
	};
	const openDisplay = async () => {
		let stream = await navigator.mediaDevices.getDisplayMedia({
			video: { cursor: "always", displaySurface: "monitor" },
		});
		// console.log("Got mediastream : ", stream);
		// console.log(displayRef.current);
		displayRef.current.srcObject = stream;
		return;
	};
	const loadAllMsgs = async () => {
		const mss = await getMsgs();
		// console.log("achi !!!");
		// console.log(mss);
		setMsgs(mss);
		messages = mss;
		scrollRef.current.scrollTop =
			scrollRef.current.scrollHeight - scrollRef.current.clientHeight;
	};
	const iceCandidateEventHandler = (e) => {
		if (e.candidate) {
			// console.log("candidate emit kori");
			// console.log(peerRef.current.signalingState);
			socket.emit("candidate", {
				type: "new-ice-candidate",
				candidate: e.candidate,
			});
		}
	};
	const newICECandidateHandler = async (data) => {
		// console.log("candidate pailam", data);
		try {
			const candidate = new RTCIceCandidate(data.candidate);
			await peerRef.current.addIceCandidate(candidate);
		} catch (error) {
			// console.log(error);
		}
	};
	const negotiationNeededEventHandler = async () => {
		// console.log("offer pathacchi...");
		try {
			const offerObj = await peerRef.current.createOffer();
			await peerRef.current.setLocalDescription(offerObj);
			const data = {
				type: "offer",
				sdp: peerRef.current.localDescription,
			};

			socket.emit("offer", data);
		} catch (error) {
			// console.log(error);
		}
	};
	const signalingStateChangeEventHandler = () => {
		// console.log(peerRef.current.signalingState);
	};
	const offerHandler = async (data) => {
		// console.log("offer pailam...");
		// console.log(data);
		try {
			peerRef.current = createPeer();
			peerRef.current.setRemoteDescription(
				new RTCSessionDescription(data.sdp)
			);
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
			// console.log("answer pathacchi...");
			socket.emit("answer", ansData);
		} catch (error) {
			// console.log(error);
		}
	};
	const answerHandler = async (ansData) => {
		// console.log("answer pailam");
		// console.log(ansData);
		try {
			const desc = new RTCSessionDescription(ansData.sdp);
			await peerRef.current.setRemoteDescription(desc);
		} catch (error) {
			// console.log(error);
		}
	};
	const trackEventHandler = (e) => {
		// console.log(e.streams);
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
		// peerConnection.onremovetrack = removeTrackEventHandler;
		// peerConnection.oniceconnectionstatechange = iceConnectionStateChangeEventHandler;
		// peerConnection.onicegatheringstatechange = iceGatheringStateChangeEventHandler;
		peerConnection.onsignalingstatechange = signalingStateChangeEventHandler;

		return peerConnection;
	};

	useEffect(() => {
		//openMediaDevices();
		//openDisplay();
		negotiated = false;
		// console.log("heee");
		!bool && loadAllMsgs();
		console.log(scrollRef.current.scrollTop);
		scrollRef.current.scrollTop =
			scrollRef.current.scrollHeight - scrollRef.current.clientHeight;
		console.log(scrollRef.current.scrollTop);

		socket.on("chat", (data) => {
			console.log("received data", data);
			console.log(msgs);
			const allMsgs = [data, ...messages];
			messages.unshift(data);
			setMsgs(allMsgs);
			console.log(msgs);

			console.log(scrollRef.current);
			scrollRef.current.scrollTop =
				scrollRef.current.scrollHeight - scrollRef.current.clientHeight;
		});

		socket.on("otherUsers", (otherRemoteUsers) => {
			// console.log(otherRemoteUsers);
			setRemoteUsers(otherRemoteUsers);
			//var signalingChannel = new SignalingChannel(otherRemoteUser[0]);
		});
		socket.on("newUser", (newRemoteUser) => {
			// console.log(newRemoteUser);
		});
		socket.on("offer", (data) => offerHandler(data));
		socket.on("answer", (ansData) => answerHandler(ansData));
		socket.on("candidate", (data) => newICECandidateHandler(data));
		!bool && setBool(true);
		//return () => socket.disconnect();
	}, []);
	//const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

	const theme = React.useMemo(
		() =>
			createMuiTheme({
				palette: {
					type: "dark",
				},
			}),
		[]
	);
	const useStyles = makeStyles((theme) => ({
		margin: {
			margin: theme.spacing(1),
		},
		paper: { backgroundColor: "#212121" },
		button: {
			margin: theme.spacing(1),
		},
		small: {
			width: theme.spacing(3),
			height: theme.spacing(3),
		},
		color: {
			color: theme.palette.getContrastText("#87556f"),
			backgroundColor: "#87556f",
		},
	}));
	const classes = useStyles();
	const changeHandler = (e) => {
		setMyMsg(e.target.value);
		// console.log(myMsg);
	};
	const submitHandler = (e) => {
		e.preventDefault();
		const msgObj = {
			user_id: fetchedData.user.user_id,
			username: fetchedData.user.name,
			color: fetchedData.user.color,
			time: new Date().toISOString(),
			message: myMsg,
		};
		const allMsgs = [msgObj, ...messages];
		setMsgs(allMsgs);
		setShowPicker(false);
		messages.unshift(msgObj);
		socket.emit("chat", msgObj);
		scrollRef.current.scrollTop =
			scrollRef.current.scrollHeight - scrollRef.current.clientHeight;
		e.target.reset();
	};

	const renderMessages = () => {
		let allmsg = [];
		// console.log(msgs);
		msgs.map((msg) => {
			// console.log(typeof msg.time);
			allmsg.push(
				<div
					className={`${
						msg.username !== fetchedData.user.name
							? styles.notMyMsgContainer
							: styles.myMsgContainer
					}`}
				>
					{msg.username !== fetchedData.user.name && (
						<Avatar
							className={`${classes.color} ${classes.small} ${styles.avatar}`}
						>
							{msg.username.charAt(0)}
						</Avatar>
					)}
					<div
						className={`${styles.msg} ${
							msg.username !== fetchedData.user.name
								? styles.notMyMsg
								: styles.myMsg
						}`}
					>
						<div>{msg.message}</div>
						<div className={styles.timee}>
							{new Date(Date.parse(msg.time))
								.toString()
								.substr(0, 24)}
						</div>
					</div>
				</div>
			);
		});
		return allmsg;
	};
	const emojiHandler = (emoji) => {
		// console.log(emoji);
		inputRef.current.value += emoji.native;
		setMyMsg(inputRef.current.value);
	};
	const pickerHandler = (e) => {
		setShowPicker(!showPicker);
	};
	const callHandler = async () => {
		// console.log("r k k ache dekhchi : ");
		socket.emit("give_otherUsers");
		peerRef.current = createPeer("caller");
		const localStream = await openMediaDevices();
		for (const track of localStream.getTracks()) {
			peerRef.current.addTrack(track, localStream);
		}
	};
	return (
		<div className={styles.boxContainer}>
			{/* <video
				ref={mediaRef}
				id="localVideo"
				autoplay
				playsinline
				controls="false"
			/> */}
			<ThemeProvider theme={theme}>
				<Box className={styles.box}>
					<Paper className={styles.formContainer} elevation={5}>
						<Paper
							variant="outlined"
							ref={scrollRef}
							className={`${styles.msgContainer} ${classes.paper}`}
						>
							{bool == true ? renderMessages() : void 0}
						</Paper>
						<form
							className={styles.chatBox_form}
							noValidate
							autoComplete="off"
							onSubmit={(e) => submitHandler(e)}
						>
							<TextField
								id="outlined-basic1"
								multiline={true}
								label="Post a message"
								onClick={() =>
									showPicker ? setShowPicker(false) : void 0
								}
								onChange={(e) => changeHandler(e)}
								inputRef={inputRef}
								className={styles.inputBox}
							/>
							<SentimentSatisfiedOutlinedIcon
								fontSize="large"
								color="disabled"
								className={styles.emojiLogo}
								onClick={(e) => pickerHandler(e)}
							/>
							<Button
								type="submit"
								variant="contained"
								color="secondary"
								className={classes.button}
								endIcon={<SendIcon />}
							>
								Send
							</Button>
						</form>
						<Picker
							title="Pick your emoji…"
							onSelect={(e) => emojiHandler(e)}
							showSkinTones={false}
							showPreview={false}
							sheetSize="64"
							set="facebook"
							style={{
								position: "relative",
								display: showPicker ? "block" : "none",
							}}
						/>
					</Paper>
					{/* <button onClick={(e) => callHandler(e)}>Call</button> */}
				</Box>
			</ThemeProvider>
			{/* <video
				ref={displayRef}
				id="displayVideo"
				autoplay
				playsinline
				controls="false"
			/> */}
		</div>
	);
}

export default ChatBox;
