import { useEffect, useState, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { useRouter } from 'next/router';

import { getUser } from '../redux/users';
import { colors } from '../utils/variables';
import CreateMemeForm from './CreateMemeForm';
import ActionModalWithSign from './ActionModalWithSign';
import { OpenLoginModalContext } from './LoginModal';

const UserWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: safe center;
`;

const AvatarImg = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 24px;
  background-image: url(${(props) => props.img});
  background-repeat: no-repeat;
  background-size: cover;
  display: inline-block;
`;

const UserLabel = styled.p`
  display: inline-block;
  color: ${colors.secondaryText};
  font-size: 14px;
  margin-right: 8px;
`;

const CreateMemeModal = () => {
  const dispatch = useDispatch();
  const { current: user, sdkUser } = useSelector((state) => state.users);

  useEffect(() => {
    getUser()(dispatch);
  }, []);

  const [isModalShown, setIsModalShown] = useState(false);

  const closeModal = () => {
    setIsModalShown(false);
  };

  const openLoginModal = useContext(OpenLoginModalContext);

  const router = useRouter();

  return (
    <>
      <ActionModalWithSign
        isShown={isModalShown}
        modalTitle="Create Meme"
        customModalTitle={
          user && (
            <UserWrapper>
              <UserLabel>as {user.name}</UserLabel>
              <AvatarImg img={user.avatarUrl} />
            </UserWrapper>
          )
        }
        actionTitle="Create Meme"
        onModalHide={closeModal}
        successMessage="Meme has born"
        actionView={(active, onSuccess, updateStepper) => (
          <CreateMemeForm updateStepper={updateStepper} onSuccess={onSuccess} onDismiss={closeModal} />
        )}
        customSuccessAction={{
          label: 'View created memes',
          action: () => {
            closeModal();
            router.push('/me/created-memes');
          },
        }}
      />
      <div className="addMemeBtn">
        <button
          className="btn btn-success btn-lg"
          onClick={() => {
            if (user && sdkUser) {
              setIsModalShown(true);
            } else {
              openLoginModal();
            }
          }}
        >
          <i className="oi oi-plus" aria-hidden="true"></i>
          <span className="ml-2">Create meme</span>
        </button>
      </div>
    </>
  );
};

export default CreateMemeModal;
