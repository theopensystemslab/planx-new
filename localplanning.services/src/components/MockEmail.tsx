export const MockEmail: React.FC = () => {
  const { origin, search } = window.location;
  const path = `/applications${search}`;
  const magicLink = `${origin}${path}`;
  
  // Container styles
  const emailContainerStyle: React.CSSProperties = {
    maxWidth: "800px",
    margin: "10px auto",
    backgroundColor: "#ffffff",
    fontFamily: "Arial, sans-serif",
    fontSize: "14px",
    lineHeight: "1.4",
    color: "#202124",
    border: "1px solid #e0e0e0",
    borderRadius: "6px",
    boxShadow: "0 1px 3px rgba(60,64,67,0.16)",
    overflow: "hidden",
    width: "100%",
    boxSizing: "border-box"
  };

  // Header styles
  const headerContainerStyle: React.CSSProperties = {
    padding: "12px 16px",
    borderBottom: "1px solid #e8eaed",
    backgroundColor: "#fafafa"
  };

  const headerContentStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "flex-start",
    marginBottom: "8px",
    flexWrap: "wrap",
    gap: "8px"
  };

  const avatarStyle = {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    backgroundColor: "#1a73e8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: "500",
    flexShrink: 0
  };

  const senderInfoStyle = {
    flex: 1,
    minWidth: "200px",
    overflow: "hidden"
  };

  const senderNameStyle: React.CSSProperties = {
    fontWeight: "500",
    fontSize: "14px",
    color: "#202124",
    wordBreak: "break-word",
    lineHeight: "1.3"
  };

  const senderEmailStyle: React.CSSProperties = {
    color: "#5f6368",
    fontWeight: "normal",
    fontSize: "12px",
    display: "block",
    marginTop: "2px",
    wordBreak: "break-all"
  };

  const recipientStyle = {
    fontSize: "12px",
    color: "#5f6368",
    marginTop: "4px"
  };

  const timestampStyle = {
    fontSize: "12px",
    color: "#5f6368",
    flexShrink: 0,
    whiteSpace: "nowrap"
  };

  // Nofify styles
  const notifyContainerStyle = {
    padding: "16px 20px",
    display: "flex",
    alignItems: "center",
    backgroundColor: "#1d70b8",
    color: "#ffffff",
    fontFamily: "Helvetica, Arial, sans-serif",
    fontSize: "28px",
    fontWeight: "700",
    verticalAlign: "middle",
  };

  // Content styles
  const contentContainerStyle = {
    padding: "30px 20px",
    backgroundColor: "#ffffff",
    color: "#0b0c0c",
  };

  const messageTextStyle = {
    margin: "0 0 20px 0",
    fontSize: "19px",
    lineHeight: "1.5",
  };

  const linkStyle: React.CSSProperties = {
    color: "#1d70b8",
    textDecoration: "underline",
    fontSize: "19px",
    fontWeight: "500",
    wordBreak: "break-all"
  };

  const warningTextStyle = {
    margin: "20px 0 0 0",
    fontSize: "19px",
    borderLeft: "10px solid #b1b4b6",
    padding: "20px 16px"
  };

  return (
    <div style={emailContainerStyle}>
      {/* Gmail-style header */}
      <div style={headerContainerStyle}>
        <div style={headerContentStyle}>
          <div style={avatarStyle}>
            D
          </div>
          <div style={senderInfoStyle}>
            <div style={senderNameStyle}>
              <strong>Digital Planning Services</strong>
              <span style={senderEmailStyle}>
                &lt;digital.planning.services@notifications.service.gov.uk&gt;
              </span>
            </div>
            <div style={recipientStyle}>
              to me
            </div>
          </div>
          <div style={timestampStyle}>
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>

      {/* Notify-style header */}
      <div style={notifyContainerStyle}>
        GOV<span style={{ color: "#00ffe0", fontSize: "32px", padding: "0 2px" }}>•</span>UK
      </div>

      {/* Email content */}
      <div style={contentContainerStyle}>
        <p style={messageTextStyle}>
          Use the link to login to localplanning.services
        </p>
        <a href={path} style={linkStyle}>
          {magicLink}
        </a>
        <p style={warningTextStyle}>
          Do not share these links with anyone else.
        </p>
      </div>
    </div>
  )
}
