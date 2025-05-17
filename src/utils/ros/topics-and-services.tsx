import { getRosMsgType, getRosServiceType, rosTypes } from './messages';
import ROSLIB from 'roslib';
import { ServiceOptions } from '@/interfaces/ros/ServiceOptions';
import { ServiceType } from '@/types/RobotActionTypes';

export const servicesMessages: Record<ServiceType, string> = {
  prompt: 'rosa_prompt',
  antiCollision: 'obstacle_avoidance',
  light: 'light_control',
  stop: 'emergency_stop',
  pose: 'pose',
  mode: 'mode',
};

export const ServiceMsgType: Record<ServiceType, keyof typeof rosTypes> = {
  prompt: 'llmPrompt',
  light: 'bool',
  stop: 'bool',
  antiCollision: 'antiCollision',
  mode: 'mode',
  pose: 'pose',
};

/**
 * Mensagens dos tópicos do ROS.
 */
export const topicsMessages = {
  velocity: 'cmd_vel_joy',
  velocityNipple: 'cmd_vel_nipple',
  temperature: 'imu_temp',
  battery: 'battery',
  laserScan: 'scan',
  odometry: 'odom',
  listener: 'listener',
  map: 'map',
  jointStates: 'joint_states',
  camera: 'compressed_camera',
  sportModeState: 'lf/sportmodestate',
  robotStatus: 'robot_status',
  thermal: 'camcam/thermal/compressed_image',
  rgb: 'camcam/rgb/compressed_image',
};

/**
 * Estrutura de dados que contém o tipo de retorno das mensagens do ROS em lowerCase
 * de acordo com o nome do tópico desejado.
 * Sempre que quiser saber o tipo de retorno de um tópico, consulte essa estrutura.
 * @param Key: Nome do tópico;
 * @returns: String igual ao tipo de retorno que o ROS envia nos subscribes
 */
export const TopicMsgType: Record<
  keyof typeof topicsMessages,
  keyof typeof rosTypes
> = {
  velocity: 'twist',
  laserScan: 'laserScan',
  temperature: 'temperature',
  listener: 'string',
  odometry: 'odometry',
  map: 'occupancyGrid',
  jointStates: 'jointState',
  camera: 'image',
  battery: 'battery',
  velocityNipple: 'twist',
  sportModeState: 'sportModeState',
  robotStatus: 'robotStatus',
  thermal: 'image',
  rgb: 'image',
};

/**
 * Retorna o nome do tópico de acordo com a sua chave.
 * @param typeKey Chave contida na variável topicMessages.
 * @param isDummy Flag para pegar os valores reais ou simulados do sistema.
 * @returns String com o nome completo do tópico.
 */
export function getRosTopic(
  typeKey: keyof typeof topicsMessages,
  isDummy = false
): string {
  const topic = topicsMessages[typeKey];
  return `${isDummy ? '/dummy' : ''}/${topic}`;
}

export function getRosService(typeKey: ServiceType, isDummy = false): string {
  const service = servicesMessages[typeKey];
  return `${isDummy ? '/dummy' : ''}/${service}`;
}

export class ROSBase {
  protected ros: ROSLIB.Ros;
  protected isDummy: boolean = false;

  constructor(rosCon: ROSLIB.Ros, useDummyData: boolean = false) {
    this.ros = rosCon;
    this.isDummy = useDummyData;
  }
}

export class ROSTopicFactory extends ROSBase {
  constructor(rosCon: ROSLIB.Ros, useDummyData: boolean = false) {
    super(rosCon, useDummyData);
  }

  private createTopic = (
    topicName: keyof typeof topicsMessages
  ): ROSLIB.Topic => {
    return new ROSLIB.Topic({
      ros: this.ros,
      name: getRosTopic(topicName, this.isDummy),
      messageType: getRosMsgType(TopicMsgType[topicName]),
      compression: 'none',
      throttle_rate: 0,
      queue_size: 1,
    });
  };

  /**
   * Cria e inscreve o tópico para receber atualizações emitidas pelo
   * servidor do ROS.
   * @param topicKey Chave com o nome do tópico usado.
   * @param callback Função que será chamada dentro do subscribe sempre
   * que o tópico receber alguma nova informação do ROS.
   * @returns O tópico criado.
   */
  public createAndSubscribeTopic = <T extends ROSLIB.Message>(
    topicKey: keyof typeof topicsMessages,
    callback: (msg: T) => void
  ): ROSLIB.Topic => {
    const topic = this.createTopic(topicKey);

    topic.subscribe((msg: ROSLIB.Message) => {
      callback(msg as T);
    });

    return topic;
  };

  /**
   * Creates and subscribes to a high-frequency topic (like camera streams)
   * with optimized settings for real-time streaming.
   * @param topicKey Key for the topic name
   * @param callback Function called when topic receives new data
   * @returns The created topic
   */
  public createAndSubscribeHighFrequencyTopic = <T extends ROSLIB.Message>(
    topicKey: keyof typeof topicsMessages,
    callback: (msg: T) => void
  ): ROSLIB.Topic => {
    const topic = new ROSLIB.Topic({
      ros: this.ros,
      name: getRosTopic(topicKey, this.isDummy),
      messageType: getRosMsgType(TopicMsgType[topicKey]),
      // Settings optimized for real-time streaming
      compression: 'none',
      throttle_rate: 0,
      queue_size: 1,
    });

    // Create a local timestamp to track message processing
    let lastProcessTimestamp = 0;

    topic.subscribe((msg: ROSLIB.Message) => {
      const now = Date.now();
      // Skip processing if we're already processing messages too frequently
      // This helps with poor connections by prioritizing newer data
      if (now - lastProcessTimestamp < 33) {
        // ~30fps max = 33ms
        return;
      }

      lastProcessTimestamp = now;
      callback(msg as T);
    });

    return topic;
  };
}

export class ROSServiceFactory extends ROSBase {
  constructor(rosCon: ROSLIB.Ros, useDummyData: boolean = false) {
    super(rosCon, useDummyData);
  }

  private createService = (serviceName: ServiceType): ROSLIB.Service => {
    return new ROSLIB.Service({
      ros: this.ros,
      name: getRosService(serviceName, this.isDummy),
      serviceType: getRosServiceType(ServiceMsgType[serviceName]),
    });
  };

  public callServiceWithCallback(options: ServiceOptions) {
    const service = this.createService(options.typeKey);
    const request = new ROSLIB.ServiceRequest({
      ...options.request,
    });

    service.callService(
      request,
      options.callback ?? (() => {}),
      options.failedCallback
    );
  }
}
