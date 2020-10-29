/* eslint-disable global-require */
/* eslint-disable consistent-return */

import moment from 'moment';
import { bitcoin } from '../../App';

let utilsFuntions;
if (!process.env.JEST_WORKER_ID) {
  utilsFuntions = require('../utils/utils');
}

export default class CoreDatabase {
  constructor() {
    this.db = undefined;
  }

  getUserData = () => new Promise((resolve) => {
    const user = this.db.objects('user');

    resolve(user.slice(0, 1));
  });

  writteUser = (obj) => new Promise((resolve, reject) => {
    try {
      this.db.write(async () => {
        const userData = {
          uid: obj.uid,
          peerID: obj.peerID,
          name: obj.name,
          picture: obj.picture,
          chats: obj.chats,
          contacts: [],
          imageHash: obj.picture ? await bitcoin.sha256(obj.picture) : null
        };
        this.db.create(
          'user',
          userData,
          true
        );
        resolve(userData);
      });
    } catch (e) {
      reject(e);
    }
  });

  /**
   * save new ipv6 in the database
   * @param {*} uid  uid user
   * @param {*} ipv6 new ipv6 address
   */
  setNewIpv6 = (uid, ipv6) => new Promise((resolve, reject) => {
    try {
      this.db.write(() => {
        const userData = {
          uid,
          ipv6Address: ipv6,
        };
        this.db.create(
          'user',
          userData,
          true
        );
        resolve(userData);
      });
    } catch (e) {
      reject(e);
    }
  });

  saveUserPhoto = (obj) => new Promise((resolve, reject) => {
    try {
      this.db.write(async () => {
        this.db.create(
          'user',
          {
            ...obj,
            imageHash: obj.picture ? await bitcoin.sha256(obj.picture) : null
          },
          true
        );
        resolve(obj);
      });
    } catch (e) {
      reject(e);
    }
  });


  converToString = (realmData) => {
    try {
      const result = JSON.parse(JSON.stringify(realmData));
      return Object.values(result);
    } catch (err) {
      return [];
    }
  }


  cancelUnreadMessages = (id) => new Promise((resolve) => {
    this.db.write(() => {
      try {
        const chat = this.db.objectForPrimaryKey('Chat', id);
        const notRead = this.converToString(chat.queue);
        chat.queue = [];
        resolve(notRead);
      } catch (err) {
        console.log('cancel unread', err);
      }
    });
  });


  cancelMessages = () => new Promise((resolve) => {
    this.db.write(() => {
      const messages = this.db.objects('Message').filter((data) => {
        const timeCreated = moment(data.shippingTime);
        return (
          moment().diff(timeCreated, 's') > 60 && data.status === 'pending'
        );
      });

      const msg = messages.slice();
      messages.forEach((data, key) => {
        messages[key].status = 'not sent';
      });
      if (msg.length >= 1) {
        resolve(msg.length);
      }
    });
  });

  addContacts = (uid, obj, update) => new Promise((resolve) => {
    this.db.write(() => {
      try {
        const user = this.db.objectForPrimaryKey('user', uid);
        user.contacts.push({
          uid: obj[0].uid,
          name: obj[0].name,
          picture: obj[0].picture,
          hashUID: obj[0].hashUID,
          nodeAddress: obj[0].nodeAddress
        });

        if (!update) {
          user.chats.push({
            fromUID: uid,
            toUID: obj[0].uid,
            messages: [],
            queue: []
          });
        }
        resolve({
          fromUID: uid,
          toUID: obj[0].uid,
          messages: {},
          queue: []
        });
      } catch (error) {
        console.log('error', error);
      }
    });
  });

  setMessage = (id, obj, status) => new Promise((resolve, reject) => {
    this.db.write(() => {
      try {
        const chat = this.db.objectForPrimaryKey('Chat', id);
        const time = new Date().getTime();
        const file = obj.msg.typeFile
          ? {
            fileType: obj.msg.typeFile,
            file: obj.msg.file
          }
          : null;
        console.log('sendImage', obj);
        chat.messages.push({
          ...obj,
          id: obj.msgID,
          msg: obj.msg.text,
          file,
          shippingTime: new Date().getTime(),
          status
        });
        chat.timestamp = time;
        resolve({ file, time });
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn('setMessage', err);
        // reject(err);
      }
    });
  });

  verifyValidMessage = (contactId) => new Promise((resolve, reject) => {
    this.db.write(() => {
      try {
        const contact = this.db.objectForPrimaryKey('Contact', contactId);
        if (contact) {
          resolve();
        } else {
          throw new Error('no contact found');
        }
      } catch (err) {
        reject(err);
      }
    });
  });


  addTemporalInfo = (obj) => new Promise((resolve) => {
    this.db.write(() => {
      this.db.create('temporalContacts', {
        ...obj
      }, true);
      resolve(obj);
    });
  });


  getTemporalContact = (id) => new Promise((resolve) => {
    const temporal = this.db.objectForPrimaryKey('temporalContacts', id);
    if (temporal) {
      resolve(JSON.parse(JSON.stringify(temporal)));
    } else {
      resolve(undefined);
    }
  });

  getMessageByTime = () => new Promise((resolve) => {
    const currentTime = moment();
    this.db.write(() => {
      const data = this.db.objects('Message').filtered('toUID == null');
      const temporalNames = this.db.objects('temporalContacts').filter((temporalContact) => {
        const timeCreated = moment(temporalContact.timestamp);
        return currentTime.diff(timeCreated, 'h') > 48;
      });
      if (data.length > 500) {
        const result = data.slice(0, 500);
        this.db.delete(result);
      }

      const newData = data.filter((filterData) => {
        const timeCreated = moment(filterData.timestamp);
        return currentTime.diff(timeCreated, 'h') > 48;
      });

      this.db.delete(newData);
      this.db.delete(temporalNames);
      resolve(JSON.parse(JSON.stringify(data)));
    });
  });


  deleteContact = (data) => new Promise((resolve) => {
    this.db.write(() => {
      // eslint-disable-next-line array-callback-return
      const contact = this.db.objects('Contact').filter((filterContact) => {
        const result = data.find((element) => filterContact.uid === element.uid);

        if (result) {
          return result.uid === filterContact.uid;
        }
      });
      // eslint-disable-next-line array-callback-return
      const chats = this.db.objects('Chat').filter((chat) => {
        const resultContact = contact.find((cont) => chat.toUID === cont.uid);

        if (resultContact) {
          return resultContact.uid === chat.toUID;
        }
      });


      this.db.delete(chats);
      this.db.delete(contact);
      resolve(true);
    });
  });

  editContact = (object) => new Promise((resolve) => {
    this.db.write(() => {
      this.db.create(
        'Contact',
        {
          ...object
        },
        true
      );
      resolve(object);
    });
  })

  listenerr = (chats, changes) => {
    changes.insertions.forEach((index) => {
      const { onNotification } = utilsFuntions;
      const changeChat = chats[index];
      onNotification(JSON.parse(JSON.stringify(changeChat)));
    });
  };

  realmObservable = () => {
    const chats = this.listener.objects('Message');

    chats.addListener(this.listenerr);
  };

  deleteChatss = (obj) => new Promise((resolve) => {
    this.db.write(() => {
      // eslint-disable-next-line array-callback-return
      const chat = this.db.objects('Chat').filter((msg) => {
        const result = obj.find((data) => data.toUID === msg.toUID);

        if (result) {
          return result.toUID === msg.toUID;
        }
      });

      chat.forEach((msg) => {
        this.db.delete(msg.messages);
      });

      resolve(obj);
    });
  });


  cleanChat = (id) => new Promise((resolve) => {
    this.db.write(() => {
      const chat = this.db.objectForPrimaryKey('Chat', id);

      this.db.delete(chat.messages);
      resolve(true);
    });
  });


  deleteMessage = (id, obj) => new Promise((resolve) => {
    this.db.write(() => {
      try {
        const chat = this.db.objectForPrimaryKey('Chat', id);
        const messages = chat.messages.filter((data) => {
          const result = obj.find((message) => message.id === data.id);

          return result;
        });

        this.db.delete(messages);
        resolve();
      } catch (error) {
        // console.log(error);
      }
    });
  });


  unreadMessages = (id, idMessage) => new Promise((resolve) => {
    this.db.write(() => {
      const time = new Date().getTime();
      const chat = this.db.objectForPrimaryKey('Chat', id);
      try {
        chat.queue.push(idMessage);
        chat.timestamp = time;
        resolve(time);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.log(err);
      }
    });
  });

  addStatusOnly = (eventStatus) => new Promise((resolve) => {
    this.db.write(() => {
      try {
        const message = this.db.objectForPrimaryKey(
          'Message',
          eventStatus.data.msgID
        );
        message.status = eventStatus.data.status;

        resolve();
      } catch (err) {
        if (Array.isArray(eventStatus.data.msgID)) {
          // eslint-disable-next-line array-callback-return
          eventStatus.data.msgID.map((id) => {
            const message = this.db.objectForPrimaryKey('Message', id);
            message.status = eventStatus.data.status;
          });
          resolve();
        }
      }
    });
  });

  updateMessage = (message) => new Promise((resolve) => {
    this.db.write(() => {
      try {
        this.db.create(
          'Message',
          {
            ...message,
            status: 'pending'
          },
          true
        );
        const msg = this.db.objectForPrimaryKey('Message', message.id);
        resolve(msg);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.log('in the cath', err);
      }
    });
  });

  getAllData = () => new Promise((resolve, reject) => {
    try {
      const user = this.db.objects('user');
      const seed = this.seed.objects('Seed');
      resolve({ user: user[0], seed: seed[0] });
    } catch (err) {
      reject();
    }
  })

  savePhotoContact = (id, path, imageHash) => new Promise((resolve) => {
    this.db.write(() => {
      const result = this.db.objects('Contact').find((contact) => id === contact.hashUID);
      result.picture = path;
      result.imageHash = imageHash;
      resolve();
    });
  })
}
