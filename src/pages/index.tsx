import Layout from "@/layouts/BaseLayout";
import HomeView from "@/views/home/HomeView";
import useWallet from "@/hooks/contracts/useWallet";
import dynamic from "next/dynamic";
import {IChartData} from "@/interfaces/IChartData";
import ChartData from "@/data/chart/ChartData";
import {NextPage} from "next";
import {fetchGitHubImages, IGithubFetchResponseType} from "@/utils/fetchGitHubImages";
import ImageImporter from "@/plugin/ImageImporter";
import {fetchGitHubTokens} from "@/utils/fetchGitHubTokens";
import {useEffect} from "react";
import {ITokenList} from "@/interfaces/ITokenList";

const WelcomeModal = dynamic(() => import('@/views/home/components/modals/WelcomeModal'));

interface HomeProps {
    chartData: IChartData[],
    contractAddress: string,
    images: IGithubFetchResponseType[]
    tokenData: ITokenList
}

const Home: NextPage<HomeProps> = ({images, contractAddress, chartData, tokenData}) => {
    const walletData = useWallet();

    // useEffect(() => {
    //     const fetchData = async () => {
    //         try {
    //             const data = await fetch(tokens[0].download_url)
    //             console.log(data)
    //
    //         } catch (error) {
    //             console.error('Error fetching data:', error);
    //
    //         }
    //     };
    //     fetchData();
    // }, [tokens]);
    // console.log(tokenData)

    return (
        <Layout title="Swap">
            {
                images.map((data: IGithubFetchResponseType, index: number) => {
                    return <ImageImporter key={index} src={data.download_url as string} alt={data.name} w={121}
                                          h={121}/>
                })
            }
            <WelcomeModal/>
            <HomeView
                tokenData={tokenData}
                contractAddress={contractAddress}
                chartData={chartData}
                blockNumber={walletData.blockNumber}
                networkInfo={walletData.networkInfo}
                walletInfo={walletData.walletInfo}
            />
        </Layout>
    );
}

export async function getServerSideProps() {
    try {
        const {images} = await fetchGitHubImages();
        const {tokens} = await fetchGitHubTokens();

        // Fetch data from the external URL
        const response  = await fetch(tokens[0].download_url);

        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }

        // Parse the JSON data
        const tokenData = await response.json() as ITokenList;

        return {
            props: {
                images,
                tokenData,
                chartData: ChartData,
                contractAddress: process.env.BTC_CONTRACT_ADDRESS,
            },
        };
    } catch (error) {
        console.error(error);
        return {
            props: {
                images: [],
                chartData: ChartData,
                contractAddress: process.env.BTC_CONTRACT_ADDRESS,
            },
        };
    }
}

export default Home