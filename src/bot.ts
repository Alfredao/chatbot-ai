// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import {ActivityHandler, MessageFactory} from 'botbuilder';
import {Configuration, OpenAIApi} from 'openai';
import {ChatCompletionResponseMessageRoleEnum} from 'openai/dist/api';

export class ChatBot extends ActivityHandler {
    constructor() {
        super();

        console.log('start')

        const openai = new OpenAIApi(new Configuration({
            apiKey: process.env.OPENAI_API_KEY
        }));

        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
        this.onMessage(async (context, next) => {

            console.log('onMessage')

            try {
                const messages = [
                    {
                        role: ChatCompletionResponseMessageRoleEnum.System,
                        content: 'Você é um chatbot de atendimento. Você trabalha em um site que vende seguidores para redes sociais chamado SocialUp, as vezes um pedido pode travar a entrega. Os pedidos são identificados pelo nome de usuário ou número. Peça ao usuário algum dado para identificar o pedido e veja por que a entrega travou acessando a nossa API. O travamento pode acontecer quando usuário informado está incorreto ou o perfil privado. Quando o perfil estiver incorreto , peça o usuário o novo nome de usuário. Quando o perfil tiver privado, peça para remover a restrição',
                    },
                    {
                        role: ChatCompletionResponseMessageRoleEnum.User,
                        content: context.activity.text
                    }
                ];

                const completion = await openai.createChatCompletion({
                    messages,
                    model: 'gpt-3.5-turbo',
                    temperature: 0.6,
                    max_tokens: 1024,
                    stream: false
                });

                console.log(completion)
                // console.log(completion.data.choices)

                const replyText = `${completion.data.choices[0].message.content}`;
                await context.sendActivity(MessageFactory.text(replyText, replyText));
            } catch (error) {
                if (error.response) {
                    console.log(error.response.status);
                    console.log(error.response.data);
                } else {
                    console.log(error.message);
                }
            }

            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });

        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;
            const welcomeText = 'Olá e seja bem vindo!';

            for (const member of membersAdded) {
                if (member.id !== context.activity.recipient.id) {
                    await context.sendActivity(MessageFactory.text(welcomeText, welcomeText));
                }
            }

            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });
    }
}
