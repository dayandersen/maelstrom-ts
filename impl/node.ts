import { BaseMessageBody, ReadMessage, TopologyResponseMessage } from "./MessageTypes.ts";
import { BaseMessage, BroadcastMessage, BroadcastResponseMessage, EchoMessage, EchoResponseMessage, InitMessage, MessageType, ReadResponseMessage, TopologyMessage } from "./messageTypes.ts";

export class Node {
    nodeId: string;
    neighbors: string[]
    topology: Map<string, string[]> | undefined
    // Need support for have received this message from this node before
    // Do I need support for "have received this message Id before"?
    // Need support for printing messages I've received by node ID?
    // Need support for printing all message received.
    receivedMessages: Set<string>;
    // Maps messageIds to message.
    messageSentCount: number;

    constructor(initMessage: InitMessage) {
      this.nodeId = initMessage.node_id;
      this.neighbors = initMessage.node_ids;
      this.receivedMessages = new Set();
      this.messageSentCount = 3;
    }

    topo(topoMessage: TopologyMessage): TopologyResponseMessage {
      this.topology = topoMessage.topology;
      return {
        type: MessageType.TopologyOk,
        msg_id: this.messageSentCount,
        in_reply_to: topoMessage.msg_id
      }
    }
  
    broadcast(broadcastMessage: BroadcastMessage): BroadcastResponseMessage {
      // TODO 1: By default we only send a message if we haven't sent one before.
      // I know in the future delivery won't be guaranteed so we'll need a process for handling response failures/acks
      // TODO 2: We need to move the broacast sending move to be independent of the broadcast ok response
      
      if (!this.receivedMessages.has(broadcastMessage.message)) {
        this.receivedMessages.add(broadcastMessage.message)
        for (const neighbor of this.neighbors) {
          const neighborBaseMessage: BaseMessage = {
            src: this.nodeId,
            dest: neighbor,
            body: broadcastMessage
          }
          console.log(JSON.stringify(neighborBaseMessage))
        }
      }

      return {
        type: MessageType.BroadcastOk,
        msg_id: this.messageSentCount,
        in_reply_to: broadcastMessage.msg_id
      }
    }

    broadcastOk(BroadcastResponseMessage: BroadcastResponseMessage) {
      // rn this is a no-op, in the future it'll be an ack based approach and so we'll need to see one of these before we stop sending broadcast messages to a node.
      return 
    }

    read(readMessage: ReadMessage): ReadResponseMessage {
      return {
        type: MessageType.ReadOk,
        messages: [...this.receivedMessages],
        msg_id: this.messageSentCount,
        in_reply_to: readMessage.msg_id
      }
      
    }

    echo(echoMsg: EchoMessage): EchoResponseMessage {
        return {
          type: MessageType.EchoOk,
          msg_id: this.messageSentCount,
          echo: echoMsg.echo,
          in_reply_to: echoMsg.msg_id
        }
    }

    reply(src: string, message: BaseMessageBody) {
      let respBody;
      switch (message.type) {
        case (MessageType.Broadcast):
          respBody = this.broadcast(message as BroadcastMessage)
          break;
        case (MessageType.Read):
          respBody = this.read(message as ReadMessage)
          break;
        case (MessageType.Topology):
          respBody = this.topo(message as TopologyMessage);
          break;
        case (MessageType.Echo):
          respBody = this.echo(message as EchoMessage);
          break;
        case (MessageType.BroadcastOk):
          this.broadcastOk(message as BroadcastResponseMessage)
          return
        default:
          throw new Error("Unsupported type for Node handling")
      }

      this.messageSentCount += 1

      const resp: BaseMessage = {
        src: this.nodeId,
        dest: src,
        body: respBody
      }
      console.log(JSON.stringify(resp))
    }
  }