/* eslint-disable import/prefer-default-export */
export const ActionTypes = {
  // APLICATION
  INITIAL_STATE: '@@aplication/INITIAL_STATE',
  GET_PHOTO: '@@aplication/GET_PHOTO',
  ROUTE: '@@aplication/ROUTE',
  CHANGE_TAB: '@@aplication/CHANGE_TAB',
  LOADING_ON: '@@aplication/LOADING_ON',
  LOADING_OFF: '@@aplication/LOADING_OFF',
  OPEN_MENU: '@@aplication/OPEN_MENU',
  CLOSE_MENU: '@@aplication/CLOSE_MENU',
  APP_STATUS: '@@aplication/VERYFY_STATUS',
  CLEAR_ALL: '@@aplication/CLEAR_ALL',
  URL_CONNECTION: '@@aplication/URL_CONNECTION',
  CONNECTION_ATTEMPT: '@@aplication/CONNECTION_ATTEMPT',
  MANUAL_CONNECTION: '@@aplication/MANUAL_CONNECTION',
  NOT_CONNECTED_VALID_AP: '@@aplication/NOT_CONNECTED_VALID_AP',
  SET_NEW_IPV6: '@@aplication/SET_NEW_IPV6',
  SET_NODE_ADDRESS: '@@aplication/SET_NODE_ADDRESS',
  OPENING_HIDDEN_PANEL: '@@aplication/OPENING_HIDDEN_PANEL',
  CLOSE_HIDDEN_PANEL: '@@aplication/OPENING_HIDDEN_PANEL',

  // CONFIGURATION
  GET_PHOTO_USER: '@@configuration/GET_PHOTO',
  EDIT_NAME: '@@configuration/EDIT_NAME',
  CLEAN_ADDRESS_LISTEN: '@@configuration/CLEAN_ADDRESS_LISTEN',

  // CONTACTS

  ADD_CONTACTS: '@@contacts/ADD_CONTACTS',
  DELETE_CONTACT: '@contacts/DELETE_CONTACT',
  EDIT_CONTACT: '@contacts/EDIT_CONTACT',
  SAVE_PHOTO: '@contacts/SAVE_PHOTO',

  // CHATS

  RELOAD_BROADCAST_CHAT: '@@chat/RELOAD_BROADCAST_CHAT',
  IN_VIEW: '@@chat/IN_VIEW',
  SELECTED_CHAT: '@@chat/SELETED_CHAT',
  NEW_MESSAGE: '@@chat/NEW_MESSAGE',
  DELETE_MESSAGE: '@@chat/DELETE_MESSAGE',
  DELETE_ALL_MESSAGE: '@@chat/DELETE_ALL_MESSAGE',
  DELETE_SELECTED_MESSAGE: '@@chat/DELETE_SELECTED_MESSAGE',
  UNREAD_MESSAGES: '@@chat/UNREAD_MESSAGES',
  SET_STATUS_MESSAGE: '@@chat/SET_STATUS_MESSAGE',
  SEND_AGAIN: '@@chat/SEND_AGAIN',
  UPDATE_STATE: '@@chat/UPDATE_STATE',
  CHAT_SERVICE_STATUS: '@@chat/CHAT_SERVICE_STATUS',
  NEW_PEER_CONNECTED: '@@chat/NEW_PEER_CONNECTED',
  REMOVED_PEER: '@@chat/REMOVED_PEER',
  ENABLE_BROADCAST: '@@chat/ENABLE_BROADCAST',
  DISABLE_BROADCAST: '@@chat/DISABLE_BROADCAST',
  MESSAGE_IS_PLAYING: '@@chat/MESSAGE_IS_PLAYING',
  STOP_PLAYBACK: '@@chat/STOP_PLAYBACK',
  STOP_PLAYING: '@@chat/STOP_PLAYING',
  
  // DEVICE SETTINGS
  GET_DEVICE_INFO: '@@deviceSettings/GET_DEVICE_INFO',
  SET_DEVICE_CONNECTION_STATUS: '@@deviceSettings/SET_DEVICE_CONNECTION_STATUS',
  UPDATE_DEVICE_DATA_AP: '@@deviceSettings/UPDATE_DEVICE_DATA_AP',
  UPDATE_DEVICE_DATA_STA: '@@deviceSettings/UPDATE_DEVICE_DATA_STA',
  ACTIVE_OR_DESACTIVE_STA: '@@deviceSettings/ACTIVE_OR_DESACTIVE_STA',
  AUTH_SETTING_DEVICE: '@@deviceSettings/AUTH_SETTING_DEVICE',
  CHANGE_CREDENTIAL: '@@deviceSettings/AUTH_SETTING_DEVICE'
};
