import axios from 'axios';

export const fastgptApi = {
    getFastgpt: async (messages: any[], variables?: any, chatId?: string, responseChatItemId?: string, stream = false, detail = false) => {
        try {
            const response = await axios({
                method: 'POST',
                url: 'https://api.fastgpt.in/api/v1/chat/completions',
                headers: {
                    'Authorization': 'Bearer fastgpt-z4xHomNZkpebsaUDkInPovGVsemqntYJBbEGv3OvdpDBbsasCpN360TYuCTAGvNT9',
                    'Content-Type': 'application/json'
                },
                data: {
                    chatId: chatId || 'my_chatId',
                    stream,
                    detail,
                    responseChatItemId: responseChatItemId || 'my_responseChatItemId',
                    variables: variables || {},
                    messages
                }
            });
            
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(`FastGPT API 请求失败: ${error.message}`);
            }
            throw error;
        }
    }
}