
import RNFS from 'react-native-fs';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { ActionTypes } from '../constants';
import { notification, FileDirectory } from '../../utils/utils';
import { database, chatService } from '../../../App';
import { messageType } from '../../utils/constans';


/**
 *here are all the actions of sending and receiving messages
 *@module ChatAction
 */

/**
 * @function
 * @description send the messages to the socket and save them in the database
 * @param {object} data Information about the chat
 * @param {string} data.toUID address where the message will be sent
 * @param {object} data.msg  message content
 * @param {number} timestamp sent date
 * @param  {string} type type message
 * @returns {object}
 */

export const initialChat = (fromUID, data, status) => async (dispatch) => {
  database.setMessage(data.toUID, { ...data, fromUID }, status).then((res) => {
    if (!process.env.JEST_WORKER_ID) {
      chatService.send(JSON.stringify(data));
    }
    dispatch({
      type: ActionTypes.NEW_MESSAGE,
      payload: {
        name: undefined,
        ...data,
        fromUID,
        time: res.time,
        shippingTime: res.time,
        msg: data.msg.text,
        id: data.msgID,
        status
      }
    });
  });
};

/**
 * @function
 * @description This function is executed every time a new message arrives
 * from the socket and saves it in the database.
 * @param {object} data Information about the message
 * @param {string} data.toUID address where the message will be sent
 * @param {string} data.fromUID uid who is sending the message
 * @param {object} data.msg  message content
 * @param {number} data.timestamp sent date
 * @param  {string} data.type type message
 * @returns {object}
 */
export const getChat = (parse) => async (dispatch) => {
  let infoMensagge;
  if (!process.env.JEST_WORKER_ID) {
    sendStatus(parse);
  }
  if (parse.msg.file) {
    parse.msg.file = await saveFile(parse.msg);
  }
  const uidChat = parse.toUID === 'broadcast' ? parse.toUID : parse.fromUID;
  const name = infoMensagge ? infoMensagge.name : undefined;
  database.setMessage(uidChat, { ...parse, name }, 'delivered').then((res) => {
    dispatch({
      type: ActionTypes.NEW_MESSAGE,
      payload: {
        name,
        ...parse,
        msg: parse.msg.text,
        id: parse.msgID,
        file: res.file,
        time: res.time
      }
    });
  });
};

export const setStatusMessage = (statusData) => async (dispatch) => {
  database.addStatusOnly(statusData).then(() => {
    dispatch({
      type: ActionTypes.SET_STATUS_MESSAGE,
      payload: statusData
    });
  });
};

/**
 * save the files in the phone memory
 * @param {Object} obj
 * @returns {Promise<string>}
 */
const saveFile = (obj) => new Promise((resolve) => {
  const connectiveAddress = Platform.OS === 'android' ? 'file:///' : '';
  if (obj.typeFile === 'image') {
    const base64File = obj.file;
    const name = `IMG_${new Date().getTime()}`;

    const directory = `${connectiveAddress}${FileDirectory}/Pictures/${name}.jpg`.trim();
    RNFS.writeFile(directory, base64File, 'base64').then(() => {
      resolve(directory);
    }).catch((err) => {
      // eslint-disable-next-line no-console
      console.log(err);
    });
  } else {
    const base64File = obj.file;
    const name = `AUDIO_${new Date().getTime()}`;
    const directory = `${FileDirectory}/${name}.aac`;
    RNFS.writeFile(`${connectiveAddress}${directory}`, base64File, 'base64').then(() => {
      resolve(`${connectiveAddress}${directory}`);
    });
  }
});

/**
 * @function
 * @description This function is executed every time a new message arrives
 * from the socket and saves it in the database.
 * @param {object} data Information about the message
 * @param {string} data.toUID address where the message will be sent
 * @param {string} data.fromUID uid who is sending the message
 * @param {object} data.msg  message content
 * @param {number} data.timestamp sent date
 * @param  {string} data.type type message
 * @returns {object}
 */

export const selectedChat = (obj) => (dispatch) => {
  if (!process.env.JEST_WORKER_ID) {
    notification.cancelAll();
  }
  dispatch({
    type: ActionTypes.SELECTED_CHAT,
    payload: obj
  });
};

/**
 * @function
 * @description reload the state of the public chats once the messages are deleted
 * @param {object} data Information about the chat
 * @returns {object}
 */

export const realoadBroadcastChat = (data) => ({
  type: ActionTypes.RELOAD_BROADCAST_CHAT,
  payload: data
});

/**
 * @function
 * @description delete messages from a specific chat
 * @param {obj} obj
 * @param {callback} callback
 */

export const deleteChat = (obj, callback) => (dispatch) => {
  database.deleteChatss(obj).then(() => {
    dispatch({
      type: ActionTypes.DELETE_MESSAGE,
      payload: obj
    });
    callback();
  });
};

/**
 * @function
 * @description delete all messages from a specific chat
 * @param {string} id
 */

export const cleanAllChat = (id) => async (dispatch) => {
  database.cleanChat(id).then(() => {
    dispatch({
      type: ActionTypes.DELETE_ALL_MESSAGE,
      payload: id
    });
  });
};

/**
 *
 * sending images with files
 * @function
 * @param {Object} data
 * @param {String} path
 * @param {String} base64
 */

export const sendMessageWithFile = (fromUID, data, path, base64) => (dispatch) => {
  const uidChat = data.toUID ? data.toUID : 'broadcast';
  const saveDatabase = { ...data, fromUID };
  saveDatabase.msg.file = path;
  database.setMessage(uidChat, { ...saveDatabase }, 'pending').then((res) => {
    saveDatabase.msg.file = base64;
    chatService.send(JSON.stringify(saveDatabase));
    dispatch({
      type: ActionTypes.NEW_MESSAGE,
      payload: {
        name: undefined,
        ...data,
        fromUID,
        msg: data.msg.text,
        id: data.msgID,
        file: res.file,
        shippingTime: res.time,
        status: 'pending'
      }
    });
  });
};

export const deleteMessages = (id, data, callback) => async (dispatch) => {
  database.deleteMessage(id, data).then(() => {
    dispatch({
      type: ActionTypes.DELETE_SELECTED_MESSAGE,
      id,
      payload: data
    });
    callback();
  });
};

/**
 * add messages to a queue of unread messages
 * @param {String} index  position of the message in the state
 * @param {String} id msg id
 * @param {String} view chat id
 */
export const messageQueue = (index, id, view) => async (dispatch) => {
  database.unreadMessages(view, id).then((time) => {
    dispatch({
      type: ActionTypes.UNREAD_MESSAGES,
      index,
      payload: id,
      time
    });
  });
};


export const sendStatus = (data) => {
  // eslint-disable-next-line global-require
  const store = require('..');
  const state = store.default.getState();
  // eslint-disable-next-line no-shadow
  const sendStatus = {
    timestamp: new Date().getTime(),
    data: {
      status: 'delivered',
      msgID: data.msgID
    },
    type: messageType.STATUS
  };
  if (data.toUID === 'broadcast') {
    sendStatus.toUID = 'broadcast';
    chatService.send(JSON.stringify(sendStatus));
  } else {
    try {
      const contacts = Object.values(state.contacts.contacts);
      contacts.forEach((contact) => {
        if (data.fromUID === contact.uid) {
          sendStatus.toUID = contact.uid;
          chatService.send(JSON.stringify(sendStatus));
        }
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log('entro en el catch', err);
    }
  }
};

/**
 * @function
 * @description Identify if we have an open chat so that notifications do not arrive
 * @param {string} idChat
 * @returns {object}
 */

export const setView = (idChat, nodeAddress) => async (dispatch) => {
  if (nodeAddress) {
    await chatService.dial(nodeAddress);
  }

  if (!idChat) {
    dispatch({
      type: ActionTypes.IN_VIEW,
      payload: idChat
    });
    return;
  }
  database.cancelUnreadMessages(idChat).then((res) => {
    if (!process.env.JEST_WORKER_ID) {
      // eslint-disable-next-line global-require
      const store = require('..');
      const state = store.default.getState();
      if (idChat && res.length > 0) {
        const chat = Object.values(state.chats.chat).find((itemChat) => itemChat.toUID === idChat);
        // eslint-disable-next-line no-shadow
        const sendStatus = {
          toUID: chat.toUID,
          timestamp: new Date().getTime(),
          data: {
            status: 'read',
            msgID: res
          },
          type: messageType.STATUS
        };
        chatService.send(JSON.stringify(sendStatus));
      }
    }
    dispatch({
      type: ActionTypes.IN_VIEW,
      payload: idChat
    });
  });
};

/**
 * function executed enter the chat  view its function es to send a read status
 *
 */
export const sendReadMessageStatus = (sendStatus) => () => {
  chatService.send(JSON.stringify(sendStatus));
};

export const sendAgain = (message) => (dispatch) => {
  database.updateMessage(message).then((res) => {
    const sendObject = {
      toUID: res.toUID,
      msg: {
        text: res.msg
      },
      timestamp: res.timestamp,
      type: res.type,
      msgID: res.id,
      shippingTime: res.shippingTime
    };
    chatService.send(JSON.stringify(sendObject));
    dispatch({
      type: ActionTypes.SEND_AGAIN,
      payload: message
    });
  });
};

export const updateState = () => ({
  type: ActionTypes.UPDATE_STATE
});

/**
 * manual starting of the chat service
 *
 * @brief this function is executed jus only in the administrative panel
 */
export const startManualService = (callback) => async (dispatch) => {
  try {
    await chatService.startService();
    callback();
    dispatch({
      type: ActionTypes.CHAT_SERVICE_STATUS,
      payload: true
    });
  } catch (error) {
    console.log('couldn\'t start chat service');
  }
};

/**
 * manual stop of the chat service
 *
 * @brief this function is executed jus only in the administrative panel
 */
export const stopService = (callback) => async (dispatch) => {
  try {
    await chatService.stop();
    callback();
    dispatch({
      type: ActionTypes.CHAT_SERVICE_STATUS,
      payload: false
    });
  } catch (error) {
    console.log('couldn\'t stop chat service: ', error);
  }
};

/**
 * This action adds to the global state the count of new peers
 * @param {*} peer  peerId was returned of the chatService
 */
export const setPeers = (peer) => (dispatch, getState) => {
  const isDefined = getState().chats.peersConnected.find(((data) => data === peer));
  if (!isDefined) {
    dispatch({
      type: ActionTypes.NEW_PEER_CONNECTED,
      payload: peer
    });
  }
};

/**
 * This action removing of the the global state the pairs that  is disconnecting
 * @param {*} peer  peerId was returned of the chatService
 */
export const removeDisconnedPeers = (peer) => (dispatch, getState) => {
  const peers = getState().chats.peersConnected.filter(((data) => data !== peer));
  dispatch({
    type: ActionTypes.REMOVED_PEER,
    payload: peers
  });
};

export const setNewDials = (nodeAddress, callback) => async (dispatch) => {
  try {
    await chatService.dial(nodeAddress);
    callback(true);
  } catch (err) {
    callback(false);
  }
};

export const enableBroadcast = (callback) => async (dispatch) => {
  await AsyncStorage.setItem('broadcast', String(true));
  dispatch({
    type: ActionTypes.ENABLE_BROADCAST,
    payload: true
  });
  callback();
};

export const disableBroadcast = (callback) => async (dispatch) => {
  await AsyncStorage.removeItem('broadcast');
  dispatch({
    type: ActionTypes.DISABLE_BROADCAST,
    payload: false
  });
  callback();
};
