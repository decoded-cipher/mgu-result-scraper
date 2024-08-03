
const amqp = require('amqplib');

const process_ug = require('../helpers/process_UG.js');
const process_pg = require('../helpers/process_PG.js');

const queues = {
    fetch_queue: 'fetch_queue',
    process_queue: 'process_queue',
    generate_queue: 'generate_queue',
    transcode_queue: 'transcode_queue'
};

let connection;
let channel;


// Connect to RabbitMQ
async function connectRabbitMQ() {
    try {
        connection = await amqp.connect(process.env.RABBITMQ_URL);
        connection.on('close', () => {
            console.error('--- RabbitMQ connection closed');
            setTimeout(connectRabbitMQ, 5000);
        });
        connection.on('error', (error) => {
            console.error('--- RabbitMQ connection error', error);
        });
        channel = await connection.createChannel();
        await initializeQueue(channel);
        console.log('--- Connected to RabbitMQ');
    } catch (error) {
        console.error('Error connecting to RabbitMQ:', error);
        setTimeout(connectRabbitMQ, 5000);
    }
}


// Initialize the queues
async function initializeQueue() {
    Object.keys(queues).forEach(async (queue) => {
        await channel.assertQueue(queues[queue], { durable: true });
    });
    console.log('--- Queues initialized');

    // Prefetch 2 messages. This means that RabbitMQ won't send more than 2 messages to a worker at a time.
    channel.prefetch(2);

    consumeQueue();
}


// Consume messages from the queue
async function consumeQueue() {
    if (channel) {


        await channel.consume(queues.fetch_queue, async (msg) => {
            const content = JSON.parse(msg.content.toString());
            const { processMode, student_id, exam_id } = content;
            let qid;

            if (processMode == 'UG') {
                qid = await process_ug.fetchResult(student_id, exam_id);
            } else if (processMode == 'PG') {
                qid = await process_pg.fetchResult(student_id, exam_id);
            }
            
            channel.ack(msg);

            await sendToQueue('process_queue', {
                processMode: processMode,
                student_id: student_id,
                exam_id: exam_id,
                qid: qid
            });
        });


        await channel.consume(queues.process_queue, async (msg) => {
            const content = JSON.parse(msg.content.toString());
            const { processMode, student_id, exam_id, qid } = content;

            if (processMode == 'UG') {
                await process_ug.processResult(student_id, exam_id, qid);
            } else if (processMode == 'PG') {
                await process_pg.processResult(student_id, exam_id, qid);
            }

            channel.ack(msg);
        });
        

    } else {
        console.error('--- RabbitMQ channel is not available');
    }
}


// Send message to the queue
async function sendToQueue(queue, message) {
    if (channel) {
        await channel.sendToQueue(queues[queue], Buffer.from(JSON.stringify(message)), { persistent: true });
    } else {
        console.error('--- RabbitMQ channel is not available');
    }
}



module.exports = { connectRabbitMQ, sendToQueue };
