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
	const fetchedData = useContext(UserContext);
	const scrollRef = useRef();
	const inputRef = useRef();
	socket.on("connection", () => {
		console.log("frontend is connected");
	});

	socket.on("disconnect", () => {
		console.log("frontend is disconnected");
	});

	const loadAllMsgs = async () => {
		const mss = await getMsgs();
		console.log("achi !!!");
		//console.log(mss);
		setMsgs(mss);
		messages = mss;
		scrollRef.current.scrollTop =
			scrollRef.current.scrollHeight - scrollRef.current.clientHeight;
	};
	useEffect(() => {
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
	return (
		<div className={styles.boxContainer}>
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
			</Box>
		</div>
	);
}

export default ChatBox;
