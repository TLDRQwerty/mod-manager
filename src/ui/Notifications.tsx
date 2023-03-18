import {
  Context,
  createContext,
  Dispatch,
  useContext,
  useEffect,
  useReducer,
} from "react";

type Notification = {
  id: string;
  title: string;
  message: string;
};

enum ActionTypes {
  ADD_NOTIFICATION = "ADD_NOTIFICATION",
  REMOVE_NOTIFICATION = "REMOVE_NOTIFICATION",
}

type Actions =
  | {
      type: ActionTypes.ADD_NOTIFICATION;
      payload: Notification;
    }
  | {
      type: ActionTypes.REMOVE_NOTIFICATION;
      payload: string;
    };

type State = {
  notifications: Notification[];
};

const initialState: State = {
  notifications: [],
};

const reducers: {
  [P in ActionTypes]: (
    state: State,
    action: Extract<Actions, { type: P }>
  ) => State;
} = {
  [ActionTypes.ADD_NOTIFICATION](state, { payload }) {
    return {
      ...state,
      notifications: [...state.notifications, payload],
    };
  },
  [ActionTypes.REMOVE_NOTIFICATION](state, { payload }) {
    return {
      ...state,
      notifications: state.notifications.filter(
        (notification) => notification.id !== payload
      ),
    };
  },
};

export const NotificationsContext = createContext<
  [State, Dispatch<Actions>] | null
>(null);

export const useNotifications = (): [State, Dispatch<Actions>] => {
  const context = useContext(NotificationsContext);
  if (context == null) {
    throw new Error(
      "useNotifications must be used within a NotificationsProvider"
    );
  }
  return context;
};

function stateReducer(state: State, action: Actions): State {
  return reducers[action.type](state, action);
}

export function useAddNotification(): (notification: Notification) => void {
  const [, dispatch] = useNotifications();
  return (notification) => {
    dispatch({
      type: ActionTypes.ADD_NOTIFICATION,
      payload: notification,
    });
  };
}

export const NotificationsProvider = ({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element => {
  const [state, dispatch] = useReducer(stateReducer, initialState);

  return (
    <NotificationsContext.Provider value={[state, dispatch]}>
      {children}
      {state.notifications.map((notification) => (
        <div key={notification.id}>
          <h1>{notification.title}</h1>
          <p>{notification.message}</p>
          <button
            onClick={() => {
              dispatch({
                type: ActionTypes.REMOVE_NOTIFICATION,
                payload: notification.id,
              });
            }}
          >
            Remove
          </button>
        </div>
      ))}
    </NotificationsContext.Provider>
  );
};
