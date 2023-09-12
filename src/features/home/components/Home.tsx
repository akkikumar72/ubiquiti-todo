import TodoList from "@/features/home/components/todo/TodoList";
import NewTodo from "@/features/home/components/todo/NewTodo";

interface Props {
    Todo?: TweetType[]
}
const Home = ({Todo}: Props) => {
    if(!Todo){
        return null;
    }
    return (
        <>
            <NewTodo/>
            <TodoList tweets = {Todo}/>
        </>
    )
}

export default Home;
