import useAuth from "../hooks/useAuth";

function Profile() {

  const { user } = useAuth();

  return (
    <div className="p-10">

      <h1 className="text-4xl font-bold mb-5">
        Profile Page
      </h1>

      {user ? (
        <p>Welcome {user.name}</p>
      ) : (
        <p>No user logged in</p>
      )}

    </div>
  );
}

export default Profile;