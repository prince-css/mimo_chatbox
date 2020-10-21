import axios from "axios";

export const getMsgs = async () => {
	const res = await axios.get(` https://mimo-backend.herokuapp.com/`);
	// console.log(res);
	return res.data;
};
export const getUser = async (userObj) => {
	const res = await axios.get(
		` https://mimo-backend.herokuapp.com/user?${userObj}`
	);
	// console.log(res);
	return res;
};
