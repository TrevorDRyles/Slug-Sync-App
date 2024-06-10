import { http, HttpResponse } from 'msw';

const GET_GOALS_URL = 'http://localhost:3010/v0/goal';
const GET_GOAL_URL = 'http://localhost:3010/v0/goal/:id';
// const GET_MEMBERS_URL = 'http://localhost:3010/v0/members';
const COMMENTS_URL = 'http://localhost:3010/v0/goal/:id/comment';
const GET_USER_URL = 'http://localhost:3010/v0/user/:id';
const GET_GOAL_COUNT_URL = 'http://localhost:3010/v0/goal/count';
const ADD_GOAL_URL = 'http://localhost:3010/v0/goal/:id/join';
const GET_MEMBERS_URL = 'http://localhost:3010/v0/goal/:id/members';

const getGoalsData = [
  {id: '1', content: 'content1', recurrence: '1', title: 'Run a mile1', tag: 'Athletics'},
  {id: '2', content: 'content2', recurrence: '2', title: 'Run a mile2', tag: 'Health'},
  {id: '3', content: 'content3', recurrence: '3', title: 'Run a mile3', tag: 'Productivity'},
  {id: '4', content: 'content4', recurrence: '4', title: 'Run a mile4', tag: 'Social'},
  {id: '5', content: 'content5', recurrence: '5', title: 'Run a mile5', tag: 'Hobbies'},
  {id: '6', content: 'content6', recurrence: '6', title: 'Run a mile6', tag: 'Personal'},
  {id: '7', content: 'content7', recurrence: '7', title: 'Run a mile7'},
]

const returnBody2 = [
  {id: '1', content: 'content7', recurrence: '7', title: 'title1'},
]
const failure = new HttpResponse('Failure', {
  status: 400,
})

export const goalDataEveryWeek = {
  id: '1',
  title: 'Test Goal',
  description: 'Test Description',
  recurrence: '7',
  tag: 'Hobbies',
  completed: false
};

export const goalDataEveryDay = {
  id: '1',
  title: 'Test Goal',
  description: 'Test Description',
  recurrence: '1 day',
  completed: false
};

let dateValue = new Date().toString();

export const setDate = (newDate) => {
  dateValue = newDate;
  comment = {
    id: '1',
    data: {
      content: 'Test Comment',
      // .toString() is needed to pass the test to simulate stringification
      date: dateValue,
      user_id: '1e0d7c46-2194-4a30-b8e5-1b0a7c287e80',
    }
  }
}

let comment = {
  id: '1',
  data: {
    content: 'Test Comment',
    // .toString() is needed to pass the test to simulate stringification
    date: dateValue,
    user_id: '1e0d7c46-2194-4a30-b8e5-1b0a7c287e80',
  }
}

const multipleComments = [
  {
    id: '1',
    data: {
      content: 'Test Comment 1',
      // .toString() is needed to pass the test to simulate stringification
      date: new Date(new Date().setMinutes(new Date().getMinutes() - 10)).toString(),
      user_id: '1e0d7c46-2194-4a30-b8e5-1b0a7c287e80',
    }
  },
  {
    id: '2',
    data: {
      content: 'Test Comment 2',
      // .toString() is needed to pass the test to simulate stringification
      date: new Date(new Date().setMinutes(new Date().getMinutes() - 5)).toString(),
      user_id: '1e0d7c46-2194-4a30-b8e5-1b0a7c287e80',
    }
  },
]

const user = {
  id: '1e0d7c46-2194-4a30-b8e5-1b0a7c287e80',
  data: {
    id: '1e0d7c46-2194-4a30-b8e5-1b0a7c287e80',
    name: 'Test User',
    role: 'user',
  }
}

let goalSetting = 'EVERY_WEEK';

export const setGoalSetting = (value) => {
  goalSetting = value;
}

let multipleCommentsSet = false;

export const setMultipleComments = (value) => {
  multipleCommentsSet = value;
};

export const indexHandlers = [
    http.get(GET_GOALS_URL, async () => {
      return HttpResponse.json(getGoalsData)
    }),
  http.get(GET_GOAL_COUNT_URL, async () => {
    return HttpResponse.json(20)
  }),
  http.post(ADD_GOAL_URL, async () => {
    return HttpResponse.json({id: '1', content: 'content', recurrence: '1', title: 'title1'});
  }),
  http.get(GET_MEMBERS_URL, async () => {
    return HttpResponse.json('Not Found', {
      status: 404,
    });
  }),
  http.get(COMMENTS_URL, async () => {
    if (multipleCommentsSet) {
      return HttpResponse.json(multipleComments);
    } else {
      return HttpResponse.json([comment]);
    }
  }),
];

export const errorInAddGoalHandler = [
  http.get(GET_GOALS_URL, async () => {
    return HttpResponse.json(getGoalsData)
  }),
  http.get(GET_GOAL_COUNT_URL, async () => {
    return HttpResponse.json(20)
  }),
  http.post(ADD_GOAL_URL, async () => {
    return new HttpResponse('Not Found', {
      status: 404,
    });
  }),
];

export const indexHandlers2 = [
  http.get(GET_GOALS_URL, async () => {
    return HttpResponse.json(returnBody2)
  })
];

export const indexErrorHandlers = [
  http.get(GET_GOALS_URL, async() => {
    return failure
  }),

  http.post(GET_GOALS_URL, async () => {
    return HttpResponse.error();
  }),
];

export const viewGoalHandlers = [
  http.get(GET_GOAL_URL, async () => {
    switch(goalSetting){
      case 'EVERY_DAY':
        return HttpResponse.json(goalDataEveryDay);
      case 'EVERY_WEEK':
        return HttpResponse.json(goalDataEveryWeek);
      default:
        return HttpResponse.json(goalDataEveryWeek);
    }
  }),

  http.get(GET_MEMBERS_URL, async () => {
    return HttpResponse.json([]);
  }),

  http.get(COMMENTS_URL, async () => {
    if(multipleCommentsSet){
      return HttpResponse.json(multipleComments);
    }else{
      return HttpResponse.json([comment]);
    }
  }),

  http.get(GET_USER_URL, async () => {
    return HttpResponse.json(user);
  }),

  http.post(COMMENTS_URL, async () => {
    return HttpResponse.json([comment]);
  }),
]

export const viewGoalErrorHandlers = [
  http.get(GET_GOAL_URL, async () => {
    return new HttpResponse('Not Found', {
      status: 404,
    });
  }),
  http.get(GET_GOALS_URL, async () => {
    return HttpResponse.json(getGoalsData)
  }),
  http.get(GET_MEMBERS_URL, async () => {
    return new HttpResponse('Not Found', {
      status: 404,
    });
  }),

  http.get(COMMENTS_URL, async () => {
    return new HttpResponse('Not Found', {
      status: 404,
    });
  }),

  http.get(GET_USER_URL, async () => {
    return new HttpResponse('Not Found', {
      status: 404,
    });
  }),
];

// export const indexErrorsHandlers = [
//   http.post(ADD_GOAL_URL, async () => {
//     return HttpResponse.json('Not Found', {
//       status: 404,
//     });
//   }),
//   http.get(GET_GOALS_URL, async () => {
//     return HttpResponse.json('Not Found', {
//       status: 404,
//     });
//   }),
//   http.get(GET_GOAL_COUNT_URL, async () => {
//     return HttpResponse.json('Not Found', {
//       status: 404,
//     });
//   }),
// ];

export const invalidUserHandler = [
  http.get(GET_USER_URL, async () => {
    return new HttpResponse('Not Found', {
      status: 404,
    });
  }),
];

export const invalidCommentHandler = [
  http.post(COMMENTS_URL, async () => {
    return new HttpResponse('Not Found', {
      status: 404,
    });
  }),
];



