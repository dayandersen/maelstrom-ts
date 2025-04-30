#!/usr/bin/env deno

const decoder = new TextDecoder();

enum MessageType {
 Topology = "topology",
 Init = "init",
 Echo = "echo",
 EchoOk = "echo_ok",
 Read = "read",
 Broadcast = "broadcast",
 Error = "error",
}

interface BaseMessage {
  src: string,
  dest: string,
  body: BaseMessageBody | undefined
}

interface BaseMessageBody {
  type: string 
}

interface EchoMessage extends BaseMessageBody {
  type: MessageType.Echo,
  msg_id: number,
  echo: string
}

interface EchoResponseMessage extends BaseMessageBody {
  type: MessageType.EchoOk,
  msg_id: number,
  echo: string,
  in_reply_to: number
}

interface BroadcastMessage extends BaseMessageBody {
  type: MessageType.Broadcast,
  message: string,
  msg_id: number
}

interface ReadMessage extends BaseMessageBody {
  type: MessageType.Read,
  msg_id: number,
  key: number
}

interface InitMessage extends BaseMessageBody{
  type: MessageType.Init,
  msg_id: number,
  node_id: string,
  node_ids: string[]
}

class Node {
  nodeId: string;
  nodeIds: string[]
  constructor(initMessage: InitMessage) {
    this.nodeId = initMessage.node_id;
    this.nodeIds = initMessage.node_ids;
  }
}

class Handler {
  node: Node | undefined;

  init(message: BaseMessage) {
    const initMessage = message.body as InitMessage;
    const respBody = {
      msg_id: 123,
      in_reply_to: 1,
      type: MessageType.Init + "_ok"
    }
    const resp: BaseMessage = {
      src: initMessage.node_id,
      dest: message.src,
      body: respBody
    }
    this.node = new Node(initMessage)
    console.log(JSON.stringify(resp))
  }

  echo(message: BaseMessage) {
      const echoMsg = message.body as EchoMessage
      const respBody: EchoResponseMessage = {
        type: MessageType.EchoOk,
        msg_id: 123,
        echo: echoMsg.echo,
        in_reply_to: echoMsg.msg_id
      }

      const resp: BaseMessage = {
        // deno-lint-ignore no-extra-non-null-assertion
        src: this.node!!.nodeId,
        dest: message.src,
        body: respBody
      }
      console.log(JSON.stringify(resp))
  }
  
  handle(command: Uint8Array<ArrayBuffer>) {
    const text = decoder.decode(command)
    console.error(`Received ${text}`)
    
    if (text == "" || text == " " || text == "\n") {
      return
    }

    const parsedJson = JSON.parse(decoder.decode(command))
    console.error(`Parsed JSON as ${JSON.stringify(parsedJson)}`)
    const baseMessage = parsedJson as BaseMessage
    if (baseMessage.body == undefined) {
      throw new Error("body undefined, don't currently know how to handle")
    }
    
    const baseMessageBody = baseMessage.body as BaseMessageBody
    switch (baseMessageBody.type) {
      case MessageType.Init:
        this.init(baseMessage)
        break;

      case MessageType.Echo:
        this.echo(baseMessage)
        break;


      default:
        throw new Error(`This message type ${baseMessageBody.type} is not yet implemented`)
    }
  }
}



if (import.meta.main) {
  const handler = new Handler()
  for await(const line of Deno.stdin.readable) {
    handler.handle(line);
  }
}