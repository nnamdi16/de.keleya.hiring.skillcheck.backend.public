const token =
  // eslint-disable-next-line max-len
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJqb2huZG9lQGV4YW1wbGUuY29tIiwiaXNfYWRtaW4iOnRydWUsImVtYWlsX2NvbmZpcm1lZCI6ZmFsc2UsImlhdCI6MTY0NzkyMDMxNywiZXhwIjoxNjc5NDU2MzE3fQ.ECfRDxtlnYPoJ-PUo8fqvIncDjAC1iNAG5oScCK5nXo';
jest.mock('jsonwebtoken');
const mockedJwtService = {
  sign: jest.fn().mockReturnValue(token),
  decode: jest.fn().mockResolvedValue(true),
};

export default mockedJwtService;
