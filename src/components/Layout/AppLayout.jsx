import { Drawer, Grid, Skeleton } from '@mui/material'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { getSocket } from '../../../Socket'
import { useErrors, useSocketEvents } from '../../hooks/hook'
import { getOrSaveFromStorage } from '../../lib/features'
import { useMyChatsQuery } from '../../redux/api/api'
import { incrementNotification, setNewMessagesAlert } from '../../redux/reducers/chat'
import { setIsDeleteMenu, setIsMobile, setSelectedDeleteChat } from '../../redux/reducers/misc'
import { NEW_MESSAGE_ALERT, NEW_REQUEST, ONLINE_USERS, REFETCH_CHATS } from '../Constants/events'
import DeleteChatMenu from '../dialogs/DeleteChatMenu'
import Title from '../Shared/Title'
import ChatList from '../Specific/ChatList'
import Profile from '../Specific/Profile'
import Header from './Header'
const AppLayout = () => (WrappedComponent) => {

  return (props) => {
    const navigate = useNavigate()
    const params = useParams();
    const chatId = params.chatId;
    const dispatch = useDispatch();
    const socket = getSocket();

    const deleteMenuAnchor = useRef(null);
    const { isLoading, data, isError, error, refetch } = useMyChatsQuery("");
 
    const [onlineUsers, setOnlineUsers] = useState([]);
    
    const {isMobile} = useSelector((state) => state.misc)
    const { user } = useSelector((state) => state.auth);
    const { newMessagesAlert } = useSelector((state) => state.chat);

    
    useEffect(() => {
      getOrSaveFromStorage({ key: NEW_MESSAGE_ALERT, value: newMessagesAlert });
    }, [newMessagesAlert]);

    const handleDeleteChat = (e, chatId, groupChat) => {
      dispatch(setIsDeleteMenu(true));
      dispatch(setSelectedDeleteChat({ chatId, groupChat }));
      deleteMenuAnchor.current = e.currentTarget;
    };

    const handleMobileClose = () => dispatch(setIsMobile(false));
    useErrors([{ isError, error }]);
    const newMessageAlertListener = useCallback(
      (data) => {
        if (data.chatId === chatId) return;
        dispatch(setNewMessagesAlert(data));
      },
      [chatId]
    );
    const newRequestListener = useCallback(() => {
      dispatch(incrementNotification());
    }, [dispatch]);

    const refetchListener = useCallback(() => {
      refetch();
      navigate("/");
    }, [refetch, navigate]);

    const onlineUsersListener = useCallback((data) => {
      console.log(data);
      
      setOnlineUsers(data);

      
    }, []);

  const eventHandlers = {
      [NEW_MESSAGE_ALERT]: newMessageAlertListener,
      [NEW_REQUEST]: newRequestListener,
      [REFETCH_CHATS]: refetchListener,
      [ONLINE_USERS]: onlineUsersListener,
    };

  useSocketEvents(socket, eventHandlers);

    return (<div>
      <Title />
      <Header />

      <DeleteChatMenu
          dispatch={dispatch}
          deleteMenuAnchor={deleteMenuAnchor}
        />

      {isLoading ? (
          <Skeleton />
        ) : (
          <Drawer open={isMobile} onClose={handleMobileClose}>
            <ChatList
              w="70vw"
              chats={data?.chats}
              chatId={chatId}
              handleDeleteChat={handleDeleteChat}
              newMessagesAlert={newMessagesAlert}
              onlineUsers={onlineUsers}

            />
          </Drawer>
        )}


      <Grid container height={"calc(100vh - 4rem)"}>
        <Grid
          item
          sm={4}
          md={3}
          sx={{
            display: { xs: "none", sm: "block" },
          }}
          height={"100%"}
        >
           {isLoading ? (
              <Skeleton />
            ) : (
              <ChatList
                chats={data?.chats}
                chatId={chatId}
                handleDeleteChat={handleDeleteChat}
                newMessagesAlert={newMessagesAlert}
                onlineUsers={onlineUsers}
              />
            )}
        </Grid>
        <Grid item xs={12} sm={8} md={5} lg={6} height={"100%"}

        >
          <WrappedComponent  {...props} chatId={chatId} user={user}  />
        </Grid>

        <Grid
          item
          md={4}
          lg={3}
          height={"100%"}
          sx={{
            display: { xs: "none", md: "block" },
            padding: "2rem",
            backgroundImage: "linear-gradient(rgb(214, 119, 119), rgb(55, 79, 169))",
          }}
        >
          <Profile user={user}/>
        </Grid>

      </Grid>

    </div>
    )
  }
}

export default AppLayout;