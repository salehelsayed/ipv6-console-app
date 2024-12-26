// Remove node-fetch import since browsers have fetch built-in

interface IpifyResponse {
    ip: string
  }
  
  export async function getPublicIps(): Promise<{ ipv4: string; ipv6: string }> {
    try {
      const [ipv4Response, ipv6Response] = await Promise.all([
        fetch('https://api.ipify.org?format=json'),
        fetch('https://api6.ipify.org?format=json')
      ])
  
      if (!ipv4Response.ok || !ipv6Response.ok) {
        throw new Error('Failed to fetch public IP addresses.')
      }
  
      const ipv4Data = (await ipv4Response.json()) as IpifyResponse
      const ipv6Data = (await ipv6Response.json()) as IpifyResponse
  
      return {
        ipv4: ipv4Data.ip,
        ipv6: ipv6Data.ip
      }
    } catch (error) {
      console.error('Error fetching public IPs:', error)
      throw error
    }
  }
  