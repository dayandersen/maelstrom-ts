#!/usr/bin/env deno
import { BaseMessage, BaseMessageBody, InitMessage, MessageType } from "./messageTypes.ts";
import { Node } from "./Node.ts";

const decoder = new TextDecoder();

class Handler {
  node: Node | undefined;

  init(message: BaseMessage) {
    
    const initMessage = message.body as InitMessage;
    const respBody = {
      msg_id: 2,
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
  
  handle(command: Uint8Array<ArrayBuffer>) {
    const text = decoder.decode(command)
    console.error(`Received '${text}'`)
    for (const line of text.split("\n")) {
      if (line == "" || line == " " || line == "\n") {
        return
      }
      const parsedJson = JSON.parse(line)
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
        default:
          if (this.node) {this.node.reply(baseMessage.src, baseMessageBody)}
      }
    }
  }
}

if (import.meta.main) {
  const handler = new Handler()
  for await(const line of Deno.stdin.readable) {
    handler.handle(line);
  }
}