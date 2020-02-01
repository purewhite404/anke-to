import axios from 'axios'

const api = axios.create({
  baseURL: 'https://q.trap.jp/api/1.0',
  withCredentials: false
})

const setAuthToken = token => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common['Authorization']
  }
}

export default {
  namespaced: true,
  state: {
    accessToken: null,
    users: null,
    groups: null
  },
  getters: {
    getUsersMap(state) {
      // userIdをキーとするusersの連想配列
      if (!state.users) return null
      return Object.fromEntries(state.users.map(user => [user.userId, user]))
    },
    getActiveUsers(state) {
      if (!state.users) return null
      return state.users.filter(
        user => !user.suspended && user.name !== 'traP' && !user.bot
      )
    },
    getActiveUsersMap(_, getters) {
      // userIdをキーとするactiveなusersの連想配列
      if (!getters.getActiveUsers) return null
      return Object.fromEntries(
        getters.getActiveUsers.map(user => [user.userId, user])
      )
    },
    getGroupsMap(state) {
      // groupIdをキーとするgroupsの連想配列
      if (!state.groups) return null
      return Object.fromEntries(
        state.groups.map(group => [group.groupId, group])
      )
    },
    getSortedGroups(state, getters) {
      if (!state.groups || !getters.getActiveUsersMap) return null

      // グループ名でソート
      let groups = [...state.groups]
      groups.sort((a, b) =>
        a.name.toLowerCase().localeCompare(b.name.toLowerCase())
      )

      // グループメンバーをソート
      const sortGroupMembers = data => {
        let group = JSON.parse(JSON.stringify(data)) // deep copy

        group.members.sort((a, b) => {
          const nameA = getters.getUsersMap[a].name
          const nameB = getters.getUsersMap[b].name
          return nameA.toLowerCase().localeCompare(nameB.toLowerCase())
        })
        // activeなメンバーのみのリストを作る
        group.activeMembers = group.members.filter(
          userId =>
            getters.getActiveUsersMap[userId] &&
            getters.getActiveUsersMap[userId].name !== 'traP'
        )
        return group
      }

      groups = groups
        .map(group => sortGroupMembers(group))
        .filter(group => group.activeMembers.length > 0) // activeMembersが一人もいないグループを削除

      return groups
    },
    getSortedGroupsMap(_, getters) {
      // groupIdをキーとするgroupsの連想配列
      if (!getters.getSortedGroups) return null
      return Object.fromEntries(
        getters.getSortedGroups.map(group => [group.groupId, group])
      )
    },
    getGroupTypes(state) {
      // groupのtypeのリストを返す
      if (!state.groups) return null
      return state.groups
        .map(group => group.type)
        .filter((type, i, self) => self.indexOf(type) === i) // 重複除去
    },
    getGroupTypeMap(state, getters) {
      // typeをキー、そのtypeを持つgroupの配列を値として持つ連想配列
      if (!state.users || !state.groups) return null

      let ret = Object.fromEntries(
        getters.getGroupTypes.map(type => [type, []])
      )

      getters.getSortedGroups.forEach(group => {
        ret[group.type].push(group)
      })

      return ret
    }
  },
  mutations: {
    setAccessToken(state, token) {
      state.accessToken = token
    },
    setUsers(state, users) {
      state.users = users
    },
    setGroups(state, groups) {
      state.groups = groups
    }
  },
  actions: {
    async updateUsers({ state, commit }) {
      if (!state.accessToken) {
        console.error('no access token')
        return
      }
      setAuthToken(state.accessToken)

      await api
        .get('/users')
        .then(res => {
          commit('setUsers', res.data)
        })
        .catch(err => {
          console.log(err)
        })
    },
    async updateGroups({ state, commit }) {
      if (!state.accessToken) {
        console.error('no access token')
        return
      }
      setAuthToken(state.accessToken)

      await api
        .get('/groups')
        .then(res => {
          commit('setGroups', res.data)
        })
        .catch(err => {
          console.log(err)
        })
    }
  }
}
