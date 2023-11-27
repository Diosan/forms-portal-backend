// EFiling.class.js
import axios from 'axios';
import FormData from 'form-data';

export class EFiling {
    constructor(apiEndpoint = 'https://eservices.ttlawcourts.org/filing/dev/api/swfapi.php', apiKey = 'BzcKvpNHMICpWnS8IoVGdfZ3dJCb5B') {
        this.apiEndpoint = apiEndpoint;
        this.apiKey = apiKey;
    }

    async sendFilingData(data) {
        try {
            const formData = new FormData();
            formData.append('jsondata', JSON.stringify(data));

            const response = await axios.post(this.apiEndpoint, formData, {
                headers: {
                    ...formData.getHeaders(),
                    // 'Authorization': `Bearer ${this.apiKey}` // Uncomment if authorization is needed
                }
            });

            return response.data;
        } catch (error) {
            console.error('Error sending filing data:', error);
            throw error;
        }
    }
}
