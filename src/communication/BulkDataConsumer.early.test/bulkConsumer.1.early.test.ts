
// Unit tests for: bulkConsumer

import ProfielDataConsumer from '../Consumer/ProfileDataConsumer';

import bulkConsumer from '../BulkDataConsumer';


// bulkConsumer.test.ts

// bulkConsumer.test.ts
jest.mock("../Consumer/ProfileDataConsumer");

describe('bulkConsumer() bulkConsumer method', () => {
    let mockInit: jest.Mock;
    let mockAuthProfileUpdation: jest.Mock;

    beforeEach(() => {
        mockInit = jest.fn();
        mockAuthProfileUpdation = jest.fn();

        // Mock the methods of ProfielDataConsumer
        (ProfielDataConsumer as jest.Mock).mockImplementation(() => {
            return {
                _init_: mockInit,
                authProfileUpdation: mockAuthProfileUpdation,
            };
        });
    });

    describe('Happy Path', () => {
        it('should initialize and call authProfileUpdation successfully', async () => {
            // Arrange
            mockInit.mockResolvedValueOnce(undefined);

            // Act
            await bulkConsumer();

            // Assert
            expect(mockInit).toHaveBeenCalledTimes(1);
            expect(mockAuthProfileUpdation).toHaveBeenCalledTimes(1);
        });
    });

    describe('Edge Cases', () => {
        it('should handle error during initialization gracefully', async () => {
            // Arrange
            mockInit.mockRejectedValueOnce(new Error('Initialization Error'));

            // Act
            await bulkConsumer();

            // Assert
            expect(mockInit).toHaveBeenCalledTimes(1);
            expect(mockAuthProfileUpdation).not.toHaveBeenCalled();
        });

        it('should handle error during authProfileUpdation gracefully', async () => {
            // Arrange
            mockInit.mockResolvedValueOnce(undefined);
            mockAuthProfileUpdation.mockImplementationOnce(() => {
                throw new Error('Auth Profile Updation Error');
            });

            // Act
            await bulkConsumer();

            // Assert
            expect(mockInit).toHaveBeenCalledTimes(1);
            expect(mockAuthProfileUpdation).toHaveBeenCalledTimes(1);
        });
    });
});

// End of unit tests for: bulkConsumer
