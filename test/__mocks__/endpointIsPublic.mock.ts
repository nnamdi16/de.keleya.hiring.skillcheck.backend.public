import { EndpointIsPublic } from 'src/common/decorators/publicEndpoint.decorator';

jest.mock('src/common/decorators/publicEndpoint.decorator');
export const mockEndointIsPublic = jest.fn() as jest.MockedFunction<typeof EndpointIsPublic>;
