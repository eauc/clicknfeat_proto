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
  def []= i, data
    @users[i] = data
    self.signalConnections
  end

  def list
    @users
  end
    
  def connections
    @connections.reject! do |conn|
      (not conn[:out].respond_to?('closed?')) or conn[:out].closed?
    end
    @connections
  end

  def addConnection out, close
    connections << { out: out, close: close }
    
    if not close
      data = self.list.to_json
      out << "retry:100\ndata:#{data}\n\n"
    end
  end

  def signalConnections
    data = self.list.to_json
    connections.each do |conn|
      conn[:out] << "retry:100\ndata:#{data}\n\n"
      if conn[:close] and conn[:out].respond_to? 'close'
        conn[:out].close
      end
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
    @users[id]['connections'].reject! do |conn|
      (not conn[:out].respond_to?('closed?')) or conn[:out].closed?
    end
    @users[id]['connections']
  end

  def addUserConnection id, out, close
    userConnections(id) << { out: out, close: close }
  end

  def signalUserConnections id, msg
    data = msg.to_json
    @users[id]['connections'].each do |conn|
      conn[:out] << "retry:100\nevent:chat\ndata:#{data}\n\n"
      if conn[:close] and conn[:out].respond_to? 'close'
        conn[:out].close
      end
    end
  end
end
