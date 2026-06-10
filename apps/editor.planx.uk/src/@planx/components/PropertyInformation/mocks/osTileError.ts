/**
 * Error state returned by the OS VectorTiles API (via our `/proxy/ordnance-survey`
 * endpoint) when it responds with a 500.
 */
export const osTileError = `
  <?xml version="1.0" encoding="UTF-8"?>
  <ExceptionReport version="1.1.0" xmlns="http://www.opengis.net/ows/1.1"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.opengis.net/ows/1.1 http://schemas.opengis.net/ows/1.1.0/owsExceptionReport.xsd">
    <Exception exceptionCode="SourceMessageNotAvailable">
      <ExceptionText>service.config.transaction-counts message is not available for ExtractVariable: IdentifyTransactionCost</ExceptionText>
    </Exception>
  </ExceptionReport>
`;
