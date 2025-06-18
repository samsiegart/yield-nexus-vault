import { useAgoric } from "@agoric/react-components";

const Purses = () => {
  const { walletConnection } = useAgoric();

  return (
    <div className="card">
      <h3>Purses</h3>
      {walletConnection ? (
        <div style={{ textAlign: "left" }}>
          <div>
            <b>IST: </b>
            TODO - Render IST Balance
          </div>
        </div>
      ) : (
        "No wallet connected."
      )}
    </div>
  );
};

export default Purses;
