import React, { useState, useEffect, useContext, useRef } from "react";
import io from "socket.io-client";
import Box from "@material-ui/core/Box";
import { makeStyles, StylesProvider } from "@material-ui/core/styles";
import SendIcon from "@material-ui/icons/Send";
import {
	Button,
	Card,
	CardContent,
	TextField,
	Paper,
	Icon,
	Chip,
	Avatar,
} from "@material-ui/core";
import styles from "../css/chatBox.module.css";
import { deepPurple, orange, pink } from "@material-ui/core/colors";
import Axios from "axios";
import { getMsgs } from "../services/msgService";
import { UserContext } from "../context/userContext";
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
	const fetchedData = useContext(UserContext);
	const scrollRef = useRef();
	socket.on("connection", () => {
		console.log("frontend is connected");
	});
	socket.on("chat", (data) => {
		console.log("received data", data);
		const allMsgs = [...msgs, data];
		setMsgs(allMsgs);
		if (bool) {
			//console.log(scrollRef.current);
			scrollRef.current.scrollTop =
				scrollRef.current.scrollHeight - scrollRef.current.clientHeight;
		}
	});
	socket.on("disconnect", () => {
		console.log("frontend is disconnected");
	});

	const loadAllMsgs = async () => {
		const mss = await getMsgs();
		console.log("achi !!!");
		//console.log(mss);
		setMsgs(mss);
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
		!bool && setBool(true);
	}, []);
	const useStyles = makeStyles((theme) => ({
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
		const allMsgs = [...msgs, msgObj];
		setMsgs(allMsgs);
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
							fullWidth={true}
							id="outlined-basic1"
							label="Post a message"
							variant="outlined"
							onChange={(e) => changeHandler(e)}
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
				</Paper>
			</Box>
		</div>
	);
}

export default ChatBox;
