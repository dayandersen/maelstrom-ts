
export enum MessageType {
    Topology = "topology",
    TopologyOk = "topology_ok",
    Init = "init",
    Echo = "echo",
    EchoOk = "echo_ok",
    Read = "read",
    ReadOk = "read_ok",
    Broadcast = "broadcast",
    BroadcastOk = "broadcast_ok",
    Error = "error",
}
   
export interface BaseMessage {
    src: string,
    dest: string,
    body: BaseMessageBody | undefined
}

export interface BaseMessageBody {
    type: string 
}

export interface EchoMessage extends BaseMessageBody {
    type: MessageType.Echo,
    msg_id: number,
    echo: string
}

export interface EchoResponseMessage extends BaseMessageBody {
    type: MessageType.EchoOk,
    msg_id: number,
    echo: string,
    in_reply_to: number
}

export interface BroadcastMessage extends BaseMessageBody {
    type: MessageType.Broadcast,
    message: string,
    msg_id: number
}

export interface BroadcastResponseMessage extends BaseMessageBody {
    type: MessageType.BroadcastOk,
    msg_id: number,
    in_reply_to: number
}

export interface ReadMessage extends BaseMessageBody {
    type: MessageType.Read,
    msg_id: number,
    key: number
}

export interface ReadResponseMessage extends BaseMessageBody {
    type: MessageType.ReadOk,
    msg_id: number,
    messages: string[]
    in_reply_to: number
}

export interface InitMessage extends BaseMessageBody{
    type: MessageType.Init,
    msg_id: number,
    node_id: string,
    node_ids: string[]
}

export interface TopologyMessage extends BaseMessageBody {
    type: MessageType.Topology,
    msg_id: number,
    topology: Map<string, string[]>
}

export interface TopologyResponseMessage extends BaseMessageBody {
    type: MessageType.TopologyOk,
    msg_id: number,
    in_reply_to: number
}
