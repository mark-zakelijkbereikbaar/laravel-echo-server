import { PresenceChannel } from './presence-channel';
import { PrivateChannel } from './private-channel';
import { Log } from './../log';

var _ = require("lodash");

export class Channel {
    /**
     * Channels and patters for private channels.
     */
    protected _privateChannels: string[] = ['private-*', 'presence-*'];

    /**
     * Allowed client events
     */
    protected _clientEvents: string[] = ['client-*'];

    /**
     * Private channel instance.
     */
    private: PrivateChannel;

    /**
     * Presence channel instance.
     */
    presence: PresenceChannel;

    /**
     * Create a new channel instance.
     */
    constructor(private io, private options) {
        this.private = new PrivateChannel(options);
        this.presence = new PresenceChannel(io, options);

        if (this.options.devMode) {
            Log.success('Channels are ready.');
        }
    }

    /**
     * Join a channel.
     */
    join(socket, data): void {
        if (data.channel) {
            if (this.isPrivate(data.channel)) {
                this.joinPrivate(socket, data);
            } else {
                socket.join(data.channel);
                this.onJoin(socket, data.channel);
            }
        }
    }

    /**
     * Trigger a client message
     */
    clientEvent(socket, data): void {
        try {
            data = JSON.parse(data);
        } catch (e) {
            data = data;
        }

        if (data.event && data.channel) {
            if (this.isClientEvent(data.event) &&
                this.isPrivate(data.channel) &&
                this.isInChannel(socket, data.channel)) {
                this.io.sockets.connected[socket.id]
                    .broadcast.to(data.channel)
                    .emit(data.event, data.channel, data.data);
            }
        }
    }

    /**
     * Leave a channel.
     */
    leave(socket: any, channel: string, reason: string): void {
        if (channel) {
            if (this.isPresence(channel)) {
                this.presence.leave(socket, channel)
            }

            socket.leave(channel);

            if (this.options.devMode) {
                Log.info(`[${new Date().toLocaleTimeString()}] - ${socket.id} left channel: ${channel} (${reason})`);
            }
        }
    }

    /**
     * Check if the incoming socket connection is a private channel.
     */
    isPrivate(channel: string): boolean {
        let isPrivate = false;

        this._privateChannels.forEach(privateChannel => {
            let regex = new RegExp(privateChannel.replace('\*', '.*'));
            if (regex.test(channel)) isPrivate = true;
        });

        return isPrivate;
    }

    /**
     * Join private channel, emit data to presence channels.
     */
    joinPrivate(socket: any, data: any): void {
        this.private.authenticate(socket, data).then(res => {
            socket.join(data.channel);

            if (this.isPresence(data.channel)) {
                var member = {
                    ...res.channel_data, 
                    user_info: {
                        ...res.channel_data.user_info,
                        location: ''
                    }
                };
                try {
                    member = JSON.parse({
                        ...res.channel_data, 
                        user_info: {
                            ...res.channel_data.user_info,
                            location: ''
                        }
                    });
                } catch (e) { }
                this.presence.join(socket, data.channel, member);
            }

            this.onJoin(socket, data.channel);
        }, error => {
            if (this.options.devMode) {
                Log.error(error.reason);
            }

            this.io.sockets.to(socket.id)
                .emit('subscription_error', data.channel, error.status);
        });
    }

    /**
     * Check if a channel is a presence channel.
     */
    isPresence(channel: string): boolean {
        return channel.lastIndexOf('presence-', 0) === 0;
    }

    /**
     * On join a channel log success.
     */
    onJoin(socket: any, channel: string): void {
        if (this.options.devMode) {
            Log.info(`[${new Date().toLocaleTimeString()}] - ${socket.id} joined channel: ${channel}`);
        }
    }

    /**
     * Check if client is a client event
     */
    isClientEvent(event: string): boolean {
        let isClientEvent = false;

        this._clientEvents.forEach(clientEvent => {
            let regex = new RegExp(clientEvent.replace('\*', '.*'));
            if (regex.test(event)) isClientEvent = true;
        });

        return isClientEvent;
    }

    /**
     * Check if a socket has joined a channel.
     */
    isInChannel(socket: any, channel: string): boolean {
        return !!socket.rooms[channel];
    }


    locationChange(socket: any, data: any): void {
        try {
            data = JSON.parse(data);
        } catch (e) {
            data = data;
        }

        if (data.channel) {
            if (this.isPresence(data.channel) && this.isInChannel(socket, data.channel)) {
                let members = this.presence.getMembers(data.channel).then((members) => {
                    members = members || [];
                    let member = members.find((member) => member.socketId == socket.id);
                    // console.log(`members_1`);
                    // console.log(members);
                    // console.log(data);

                    let newMembers = members.filter((l_member) => l_member.socketId !== member.socketId);
                    newMembers.push({
                        ...member,
                        user_info: {
                            ...member.user_info,
                            // location: data.data,
                            location: {
                                location: data.data,
                                time: Math.floor(new Date().getTime() / 1000)
                            }
                        }
                    });

                    this.presence.db.set(data.channel + ":members", newMembers);

                    let newLocations = {};
                    newMembers.map((mem) => {
                        if(typeof(newLocations[mem.user_id]) == 'undefined'){
                            newLocations[mem.user_id] = {};
                        }
                        newLocations[mem.user_id][mem.socketId] = mem.user_info.location;
                    });

                    newMembers = _.uniqBy(newMembers.reverse(), "user_id");
                    
                    let finalMembers = [];
                    newMembers.map((newMember) => {
                        finalMembers.push({
                            ...newMember,
                            user_info: {
                                ...newMember.user_info,
                                location: newLocations[newMember.user_id] ? newLocations[newMember.user_id] : {} 
                            }
                        })
                    });
                    this.io.to(data.channel).emit("location", data.channel, finalMembers);
                });
            }
        }
    }

    onDisconnect(socket: any, channel: string){
        if(this.isPresence(channel)){
            this.presence.onDisconnect(socket, channel);
        }
    }

}