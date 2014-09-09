require 'securerandom'

class UserCollection
  
  ID_MAX = 1000000

  def initialize
    @users = {}
    @connections = []
  end

  def generate_id
    id = SecureRandom.random_number(ID_MAX)
    i = 0
    until not @users.has_key? id or i >= ID_MAX
      id = (id + 1) % ID_MAX
    end
    id
  end

  def create data
    i = generate_id
    data['id'] = i
    data['chat'] = []
    data['connections'] = []
    @users[i] = data

    self.signalConnections

    @users[i]
  end

  def exist? i
    @users.has_key? i
  end

  def [] i
    @users[i]
  end

  def list
    @users
  end
    
  def connections
    @connections.reject!(&:closed?)
    @connections
  end

  def addConnection out
    connections << out
    
    data = self.list.to_json
    out << "retry:100\ndata:#{data}\n\n"
  end

  def signalConnections
    data = self.list.to_json
    connections.each do |out|
      out << "retry:100\ndata:#{data}\n\n"
    end
  end

  def chatMsg data
    if self.exist? data['from']
      @users[data['from']]['chat'] << data
      self.signalUserConnections data['from'], data
    end
    data['to'].each do |to|
      if self.exist? to
        @users[to]['chat'] << data
        self.signalUserConnections to, data
      end
    end
  end
    
  def userConnections id
    @users[id]['connections'].reject!(&:closed?)
    @users[id]['connections']
  end

  def addUserConnection id, out
    userConnections(id) << out

    # @users[id]['chat'].each do |msg|
    #   data = msg.to_json
    #   out << "retry:100\nevent:chat\ndata:#{data}\n\n"
    # end
  end

  def signalUserConnections id, msg
    data = msg.to_json
    @users[id]['connections'].each do |out|
      out << "retry:100\nevent:chat\ndata:#{data}\n\n"
    end
  end
end
