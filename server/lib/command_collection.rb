class CommandCollection
  
  def initialize data
    @commands = data || []
    @connections = []
  end

  def add data
    @commands << data unless data.key?('do_not_log') and data['do_not_log']
    signalConnections data
  end

  def undo stamp
    return nil if @commands.empty? or @commands[-1]['stamp'] != stamp
    cmd = @commands.pop
    
    data = cmd.to_json
    connections.each do |out|
      out << "retry:100\nevent:undo\ndata:#{data}\n\n"
      # out.close
    end
    cmd
  end
    
  def connections
    @connections.reject!(&:closed?)
    @connections
  end

  def addConnection out, last
    connections << out
    data = {
      refresh: false,
      cmd: nil
    }
    # game just created
    if 0 === @commands.length
      data[:slice] = []
      data[:more] =  false
      out << "retry:100\ndata:#{data.to_json}\n\n"
      return
    end
    first = @commands.index do |c|
      c['stamp'] == last
    end
    first = first || -1
    # puts first.inspect
    log = @commands[first+1..-1]
    return if not log or log.length === 0
    index = 0
    while index < log.length
      # puts command.inspect
      slice = log[index..index+99]
      index += 100
      data[:slice] = slice
      data[:more] =  !(index >= log.length)
      out << "retry:100\ndata:#{data.to_json}\n\n"
    end
  end

  def removeConnection out
    connections.delete(out)
  end

  def closeAllConnections
    connections.each do |out|
      out.close
    end
    @connections = []
  end

  def signalConnections data
    data = data.to_json
    connections.each do |out|
      out << "retry:100\ndata:#{data}\n\n"
      # out.close
    end
  end

  def signalGameUpdate data
    data = data.to_json false
    connections.each do |out|
      out << "retry:100\nevent:game\ndata:#{data}\n\n"
      # out.close
    end
  end

  def to_json *a
    @commands.to_json *a
  end
end
