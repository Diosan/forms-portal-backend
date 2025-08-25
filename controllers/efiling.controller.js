import { EFiling } from '../utilities/Efiling.class.js'; 

export const sendPdfToEfiling = async (req, res) => {
    try {
        const signatureObject = {
            harrysDigitalSignature: '3045022100df5f2a67b3f1b29f7bdf36d3e8...',
            dataRecordHash: 'c3ab8ff13720e8ad9047dd39466b3c89...',
            signingTimestamp: '2022-07-01T12:34:56Z',
            userId: 'USER12345',
            dataRecordId: 'RECORD56789',
            otpCodeHash: 'e0df5f3c3a7b60b4b340c1a67cd0f9d5...',
            sallysDigitalSignature: '3046022100ae6ae8e5ccbfb04590405997ee2d52d2...'
        };

        const filingData = {
            swftransid: 'SWF0000001',
            userid: 'TTPS4732984327432',
            username: 'Sgt. Smith',
            email: 'testemail@ttps.gov.tt',
            court: 'dcrim',
            courtoffice: 'pos',
            type: 1,
            casenotes: 'These are the case notes',
            filingid: 'dcrim002',
            filepath: 'https://link.testfile.org/PDF10MB',
            returnurl: 'https://eservices.ttlawcourts.org/filing/dev/api/return.php',
            signatureobject: signatureObject 
        };

        const efiling = new EFiling();
        const response = await efiling.sendFilingData(filingData);
        console.log(response);
        res.json(response); // Send successful response back to the client
    } catch (error) {
        console.error('Error during e-filing:', error);
        res.status(500).json({ error: 'Error during e-filing process' }); // Send error response
    }
};
