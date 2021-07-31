import { ChannelEvent, RequestOptions, Channel, RequestResponseChannel} from './channel';
import { Rxmq } from './rxmq';

export { EndlessSubject, EndlessReplaySubject } from './rx/subjects';
export { ChannelEvent, RequestOptions, Channel, RequestResponseChannel };

const rxmq = new Rxmq()

export default rxmq;
