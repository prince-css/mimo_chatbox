import React, { useState, useEffect, useContext, useRef } from "react";
import "emoji-mart/css/emoji-mart.css";
import { Picker } from "emoji-mart";
import io from "socket.io-client";
import Box from "@material-ui/core/Box";
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
const socket = io("http://localhost:4000");

let messages = [
	{
		id: "",
		username: "",
		message: "",
		color: "blue",
		time: "",
	},
];

function ChatBox(props) {
	const [msgs, setMsgs] = useState(messages);
	const [myMsg, setMyMsg] = useState();
	const [bool, setBool] = useState(false);
	const [showPicker, setShowPicker] = useState(false);
	const [remoteUsers, setRemoteUsers] = useState([]);
	const fetchedData = useContext(UserContext);
	const scrollRef = useRef();
	const peer1Ref = useRef();
	const peer2Ref = useRef();
	const inputRef = useRef();
	const mediaRef = useRef();
	const displayRef = useRef();

	socket.on("connection", () => {
		console.log("frontend is connected");
	});

	socket.on("disconnect", () => {
		console.log("frontend is disconnected");
	});
	const openMediaDevices = async () => {
		let stream = await navigator.mediaDevices.getUserMedia({
			video: true,
			audio: true,
		});
		console.log("Got mediastream : ", stream);
		console.log(mediaRef.current);
		mediaRef.current.srcObject = stream;
		return stream;
	};
	const openDisplay = async () => {
		let stream = await navigator.mediaDevices.getDisplayMedia({
			video: { cursor: "always", displaySurface: "monitor" },
		});
		console.log("Got mediastream : ", stream);
		console.log(displayRef.current);
		displayRef.current.srcObject = stream;
		return;
	};
	const loadAllMsgs = async () => {
		const mss = await getMsgs();
		console.log("achi !!!");
		//console.log(mss);
		setMsgs(mss);
		messages = mss;
		scrollRef.current.scrollTop =
			scrollRef.current.scrollHeight - scrollRef.current.clientHeight;
	};
	const createPeer = (source) => {
		console.log(source);
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
		peerConnection.onicecandidate = (e) => {
			console.log(source + " er candidate dhori....");
			if (e.candidate) {
				console.log(source + " er iceCandidate emit kori...");
				socket.emit("call", {
					type: "new-ice-candidate",
					from: source,
					iceCandidate: e.candidate,
				});
			}
		};
		peerConnection.ontrack = ({ streams: [stream] }) => {
			console.log("streaming...");
			displayRef.current.srcObject = stream;
		};
		peerConnection.onsignalingstatechange = () => {
			console.log(peerConnection.signalingState);
		};
		peerConnection.onconnectionstatechange = (e) => {
			if (peerConnection.connectionState === "connected") {
				console.log("peers connected !!! ");
			}
		};
		return peerConnection;
	};

	useEffect(() => {
		//openMediaDevices();
		//openDisplay();

		console.log("heee");
		!bool && loadAllMsgs();
		//console.log(scrollRef.current.scrollTop);
		scrollRef.current.scrollTop =
			scrollRef.current.scrollHeight - scrollRef.current.clientHeight;
		//console.log(scrollRef.current.scrollTop);

		socket.on("chat", (data) => {
			//console.log("received data", data);
			//console.log(msgs);
			const allMsgs = [data, ...messages];
			messages.unshift(data);
			setMsgs(allMsgs);
			//console.log(msgs);

			//console.log(scrollRef.current);
			scrollRef.current.scrollTop =
				scrollRef.current.scrollHeight - scrollRef.current.clientHeight;
		});

		socket.on("otherUsers", (otherRemoteUsers) => {
			console.log(otherRemoteUsers);
			setRemoteUsers(otherRemoteUsers);
			//var signalingChannel = new SignalingChannel(otherRemoteUser[0]);
		});
		socket.on("newUser", (newRemoteUser) => {
			console.log(newRemoteUser);
		});
		socket.on("call", async (call) => {
			if (call.answer) {
				console.log("offer er answer pailam");
				const remoteDesc = new RTCSessionDescription(call.answer);
				await peer1Ref.current.setRemoteDescription(remoteDesc);
			} else if (call.offer) {
				console.log("offer er answer dicchi...");
				peer2Ref.current = createPeer("callee");
				const remoteDesc = new RTCSessionDescription(call.offer);
				await peer2Ref.current.setRemoteDescription(remoteDesc);
				const localStream = await openMediaDevices();
				for (const track of localStream.getTracks()) {
					peer2Ref.current.addTrack(track, localStream);
				}
				const answer = await peer2Ref.current.createAnswer();
				await peer2Ref.current.setLocalDescription(answer);
				socket.emit("call", { answer: answer });
			}
			if (call.iceCandidate) {
				try {
					//console.log("iceCandidate pailam.");
					const candidate = new RTCIceCandidate(call.iceCandidate);
					//console.log(peer2Ref.current.signalingState);
					if (
						call.from === "caller" &&
						peer2Ref.current.signalingState === "stable" &&
						peer2Ref.current.currentRemoteDescription !== null &&
						peer2Ref.current.currentLocalDescription !== null
					) {
						console.log("caller er candidate pailam");
						await peer2Ref.current.addIceCandidate(candidate);
					} else if (
						call.from === "callee" &&
						peer1Ref.current.signalingState === "stable" &&
						peer1Ref.current.currentRemoteDescription !== null &&
						peer1Ref.current.currentLocalDescription !== null
					) {
						console.log("callee er candidate pailam");
						await peer1Ref.current.addIceCandidate(candidate);
					}
				} catch (error) {
					console.log(
						"Error while receiving ice candidate : ",
						error
					);
				}
			}
		});

		!bool && setBool(true);
		//return () => socket.disconnect();
	}, []);
	const useStyles = makeStyles((theme) => ({
		margin: {
			margin: theme.spacing(1),
		},
		button: {
			margin: theme.spacing(1),
		},
		small: {
			width: theme.spacing(3),
			height: theme.spacing(3),
		},
		color: {
			color: theme.palette.getContrastText("#e91e63"),
			backgroundColor: "#e91e63",
		},
	}));
	const classes = useStyles();
	const changeHandler = (e) => {
		setMyMsg(e.target.value);
		console.log(myMsg);
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
		//console.log(msgs);
		msgs.map((msg) => {
			//console.log(typeof msg.time);
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
		console.log(emoji);
		inputRef.current.value += emoji.native;
		setMyMsg(inputRef.current.value);
	};
	const pickerHandler = (e) => {
		setShowPicker(!showPicker);
	};
	const callHandler = async () => {
		console.log("r k k ache dekhchi : ");
		socket.emit("give_otherUsers");
		peer1Ref.current = createPeer("caller");
		const localStream = await openMediaDevices();
		for (const track of localStream.getTracks()) {
			peer1Ref.current.addTrack(track, localStream);
		}
		const offer = await peer1Ref.current.createOffer();
		await peer1Ref.current.setLocalDescription(offer);
		socket.emit("call", { offer: offer });
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
			<Box className={styles.box}>
				<Paper className={styles.formContainer} elevation={5}>
					<Paper
						variant="outlined"
						ref={scrollRef}
						className={styles.msgContainer}
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
				<button onClick={(e) => callHandler(e)}>Call</button>
			</Box>
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

export default ChatBox;
