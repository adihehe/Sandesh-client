import { useNavigate } from 'react-router-dom';
import React, {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import AppLayout from "../components/Layout/AppLayout";
import { IconButton, Skeleton, Stack } from "@mui/material";
import { grayColor, orange } from "../components/Constants/Color";
import {
  AttachFile as AttachFileIcon,
  Send as SendIcon,
} from "@mui/icons-material";
import MessageComponent from "../components/Shared/MessageComponent";
import { sampleMessage } from "../components/Constants/sampleData";
import { InputBox } from "../components/styles/StyledComponents";
import FileMenu from "../components/dialogs/FileMenu";
import { getSocket } from "../../Socket";
import { useDispatch } from "react-redux";
import { useChatDetailsQuery } from "../redux/api/api";
import { ALERT, CHAT_JOINED, CHAT_LEAVED, NEW_MESSAGE } from "../components/Constants/events";
import { useErrors, useSocketEvents } from "../hooks/hook";
import { useGetMessagesQuery } from "../redux/api/api";
import { useInfiniteScrollTop } from "6pp"
import { setIsFileMenu } from "../redux/reducers/misc";
import { removeNewMessagesAlert } from "../redux/reducers/chat";
import { START_TYPING, STOP_TYPING } from "../components/Constants/events";
import { TypingLoader } from "../components/Layout/Loaders";
function Chat({ chatId, user }) {

  const socket = getSocket();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const containerRef = useRef(null);
  const bottomRef = useRef(null);

  const [page, setPage] = useState(1);
  const [fileMenuAnchor, setFileMenuAnchor] = useState(null);

  const [IamTyping, setIamTyping] = useState(false);
  const [userTyping, setUserTyping] = useState(false);
  const typingTimeout = useRef(null);
  const chatDetails = useChatDetailsQuery({ chatId, skip: !chatId });
  const oldMessagesChunk = useGetMessagesQuery({ chatId, page });

  const { data: oldMessages, setData: setOldMessages } = useInfiniteScrollTop(
    containerRef,
    oldMessagesChunk.data?.totalPages,
    page,
    setPage,
    oldMessagesChunk.data?.messages
  );


  const errors = [
    { isError: chatDetails.isError, error: chatDetails.error },
    { isError: oldMessagesChunk.isError, error: oldMessagesChunk.error },
  ];

  const members = chatDetails?.data?.chat?.members;
  const messageOnChange = (e) => {
    setMessage(e.target.value);

    if (!IamTyping) {
      socket.emit(START_TYPING, { members, chatId });
      setIamTyping(true);
    }

    if (typingTimeout.current) clearTimeout(typingTimeout.current);

    typingTimeout.current = setTimeout(() => {
      socket.emit(STOP_TYPING, { members, chatId });
      setIamTyping(false);
    }, [2000]);
  };


  const handleFileOpen = (e) => {
    dispatch(setIsFileMenu(true));
    setFileMenuAnchor(e.currentTarget);
  };
  const submitHandler = (e) => {
    e.preventDefault();

    if (!message.trim()) return;

    // Emitting the message to the server
    socket.emit(NEW_MESSAGE, { chatId, members, message });
    setMessage("");
  };

  useEffect(() => {
    socket.emit(CHAT_JOINED, { userId: user._id, members });
    dispatch(removeNewMessagesAlert(chatId));

    return () => {
      setMessages([]);
      setMessage("");
      setOldMessages([]);
      setPage(1);
      socket.emit(CHAT_LEAVED, { userId: user._id, members });
    };
  }, [chatId]);

  useEffect(() => {
    if (bottomRef.current)
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  
  useEffect(() => {
    if (chatDetails.isError) return navigate("/");
  }, [chatDetails.isError]);
  const newMessagesListener = useCallback(
    (data) => {
      if (data.chatId !== chatId) return;

      setMessages((prev) => [...prev, data.message]);
    },
    [chatId]
  );

  const startTypingListener = useCallback(
    (data) => {
      if (data.chatId !== chatId) return;

      setUserTyping(true);
    },
    [chatId]
  );

  const stopTypingListener = useCallback(
    (data) => {
      if (data.chatId !== chatId) return;
      setUserTyping(false);
    },
    [chatId]
  );


  const alertListener = useCallback(
    (data) => {
      if (data.chatId !== chatId) return;
      const messageForAlert = {
        content: data.message,
        sender: {
          _id: "djasdhajksdhasdsadasdas",
          name: "Admin",
        },
        chat: chatId,
        createdAt: new Date().toISOString(),
      };
      
      setMessages((prev) => [...prev, messageForAlert]);
    },
    [chatId]
  );

  const eventHandler = {

    [NEW_MESSAGE]: newMessagesListener,
    [START_TYPING]: startTypingListener,
    [STOP_TYPING]: stopTypingListener,
    [ALERT] : alertListener

  };

  useSocketEvents(socket, eventHandler);


  useErrors(errors)

  const allMessages = [...oldMessages, ...messages];

  return chatDetails.isLoading ? (
    <Skeleton />
  ) : (
    <Fragment>
      <Stack
        ref={containerRef}
        boxSizing={"border-box"}
        padding={"1rem"}
        spacing={"1rem"}
        bgcolor={grayColor}
        height={"90%"}
        sx={{
          overflowX: "hidden",
          overflowY: "auto",
        }}
      >

        {allMessages.map((i) => (
          <MessageComponent key={i._id} message={i} user={user} />
        ))}

        {userTyping && <TypingLoader />}

        <div ref={bottomRef} />

      </Stack>

      <form
        style={{
          height: "10%",
        }}
        onSubmit={submitHandler}

      >
        <Stack
          direction={"row"}
          height={"100%"}
          padding={"1rem"}
          alignItems={"center"}
          position={"relative"}
        >
          <IconButton
            sx={{
              position: "absolute",
              left: "1.5rem",
              rotate: "30deg",
            }}
            onClick={handleFileOpen}
          >
            <AttachFileIcon />
          </IconButton>

          <InputBox
            placeholder="Type Message Here..."
            value={message}
            onChange={messageOnChange}

          />

          <IconButton
            type="submit"
            sx={{
              rotate: "-30deg",
              bgcolor: orange,
              color: "white",
              marginLeft: "1rem",
              padding: "0.5rem",
              "&:hover": {
                bgcolor: "error.dark",
              },
            }}
          >
            <SendIcon />
          </IconButton>
        </Stack>
      </form>

      <FileMenu anchorE1={fileMenuAnchor} chatId={chatId} />
    </Fragment>
  );
};

export default AppLayout()(Chat);
